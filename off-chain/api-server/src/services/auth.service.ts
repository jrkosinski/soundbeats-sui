import { Inject, Injectable } from '@nestjs/common';
import { IAuthManager, IAuthRecord, IAuthSession } from '../repositories/auth/IAuthManager';
import { ConfigSettings } from '../config';
import { AppLogger } from '../app.logger';
import { AuthManagerModule, ConfigSettingsModule, LeaderboardModule, ReferralModule } from '../app.module';
import { IReferralCode, IReferralRepo } from 'src/repositories/referral/IReferralManager';

@Injectable()
export class AuthService {
    network: string;
    logger: AppLogger;
    authManager: IAuthManager;
    referralRepo: IReferralRepo;
    config: ConfigSettings;
    noncesToWallets: { [key: string]: string };

    constructor(
        @Inject('ConfigSettingsModule') configSettingsModule: ConfigSettingsModule,
        @Inject('AuthManagerModule') authManagerModule: AuthManagerModule,
        @Inject('ReferralModule') referralModule: ReferralModule
    ) {
        this.config = configSettingsModule.get();
        this.logger = new AppLogger('auth.service');

        //create connect to the correct environment
        this.network = this.config.suiNetwork;
        this.authManager = authManagerModule.get(this.config);
        this.referralRepo = referralModule.get(this.config);
        this.noncesToWallets = {};

        console.log(this.authManager);
    }

    /**
     * Tries to retrieve an existing SUI wallet address given the login information.
     *
     * @param authId
     * @returns The status of the search and SUI wallet address (if found)
     */
    async getAccountFromLogin(
        authId: string,
    ): Promise<{ suiWallet: string; username: string; level: number; status: string }> {
        const output = { suiWallet: '', status: '', username: '', level: 0 };
        const authRecord: IAuthRecord = await this.authManager.getAuthRecord(authId, 'sui');
        if (authRecord == null) {
            output.status = 'notfound';
        } else {
            output.suiWallet = authRecord?.suiWallet;
            output.username = authRecord.username;
            output.level = authRecord.level;
            output.status = 'success';
        }

        return output;
    }

    /**
     * Retrieves a newly created user, given their oauth token. For user accounts authenticated
     * with zklogin.
     * @param nonceToken
     * @returns a user account
     */
    async getUserFromOAuth(
        nonceToken: string,
    ): Promise<{ status: string; suiWallet: string; level: number; username: string }> {
        let output = {
            status: '',
            suiWallet: '',
            username: '',
            level: 0,
        };

        //check cache first
        if (!this.noncesToWallets) {
            output.status = 'notfound';
        } else {
            output.suiWallet = this.noncesToWallets[nonceToken];

            //get from database
            output = await this.getAccountFromLogin(output.suiWallet);
            delete this.noncesToWallets[nonceToken];
        }

        return output;
    }

    /**
     * Updates a user's game level.
     * @param authId User's account id.
     * @param level The value to set
     * @returns
     */
    async updateUserLevel(
        authId: string,
        level: number,
    ): Promise<{
        suiWallet: string;
        username: string;
        level: number;
        status: string;
    }> {
        const output = { suiWallet: '', status: '', username: '', level: 0 };
        const authRecord: IAuthRecord = await this.authManager.getAuthRecord(authId, 'sui');
        if (authRecord == null) {
            output.status = 'notfound';
        } else {
            await this.authManager.updateAuthRecord(
                authRecord.authId,
                authRecord.authType,
                authRecord.suiWallet,
                level,
            );

            output.suiWallet = authRecord?.suiWallet;
            output.username = authRecord.username;
            output.level = level;
            output.status = 'success';
        }

        return output;
    }

    /**
     * Returns true if the username is already taken (in the database) by a user.
     *
     * @param username The username in question
     * @returns boolean
     */
    async checkUsernameExists(username: string): Promise<boolean> {
        return await this.authManager.usernameExists(username);
    }

    /**
     * Starts an auth session by creating & returning an auth token.
     * @deprecated This is for use with EVM login mainly. It may be used in the future for
     * other things.
     * @param evmWallet
     * @returns
     */
    async startAuthSession(evmWallet: string): Promise<{ messageToSign: string; sessionId: string; username: string }> {
        const session = await this.authManager.startAuthSession(evmWallet);
        const account = await this.authManager.getAuthRecord(evmWallet, 'evm');
        const output = {
            username: '',
            ...session,
        };
        if (account) {
            output.username = account.username ?? '';
        }
        return output;
    }

    //TODO: comment header
    async updateUserFromOAuth(
        suiAddress: string,
        username: string,
        oauthToken: string,
        nonceToken: string,
        referralCode?: string
    ): Promise<{ username: string; authId: string; status: string, referralBeatmap: string }> {
        const output = { username: '', authId: '', status: '', referralBeatmap: '' };
        const authRecord = await this.authManager.getAuthRecord(suiAddress, 'sui');

        if (!authRecord) {
            console.log('registering user');
            if (
                await this.authManager.registerUser(suiAddress, 'sui', suiAddress, username, {
                    source: 'oauth',
                    nonce: nonceToken,
                }, referralCode)
            ) {
                output.username = username;
                output.authId = suiAddress;
                output.status = 'created';
                output.referralBeatmap = '';
            } else {
                //TODO: else?

            }
        } else {
            console.log('user found');
            output.username = authRecord.username;
            output.authId = authRecord.suiWallet;
            output.status = 'exists';
        }

        if (referralCode) {
            console.log('referral found');
            const referral: IReferralCode = await this.referralRepo.getReferralCode(referralCode);
            if (referral) {
                console.log(referral);
                output.referralBeatmap = referral.beatmapId;
            }
            else
                console.log('referral not found');
        } else {
            console.log('no referral code');
        }

        //add nonce token
        if (output.authId && output.authId.length) this.noncesToWallets[nonceToken] = output.authId;

        return output;
    }
}
