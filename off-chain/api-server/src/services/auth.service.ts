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

        this.updateUserFromOAuth(
            '0x090e7c70c81abffa0e25f654f875d346d47aaadccc56c9c3289b9e890c854fa9',
            'davidcruzline02@gmail.com',
            'eyJhbGciOiJSUzI1NiIsImtpZCI6IjI4YTQyMWNhZmJlM2RkODg5MjcxZGY5MDBmNGJiZjE2ZGI1YzI0ZDQiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI5MjQ1MTg4MDE4NjItY2hkZzFjdDloOGxpYzdtMDhhbDk2c2Njajk3dTBjY20uYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI5MjQ1MTg4MDE4NjItY2hkZzFjdDloOGxpYzdtMDhhbDk2c2Njajk3dTBjY20uYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTU2MzQ1MTI2OTQyNjk1NDI3ODIiLCJlbWFpbCI6ImRhdmlkY3J1emxpbmUwMkBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwibm9uY2UiOiJtNnV6SW1pbTJPZVdLZjU1Q1FxblZzRXl0LXciLCJuYmYiOjE3MjgyNzk5MDMsImlhdCI6MTcyODI4MDIwMywiZXhwIjoxNzI4MjgzODAzLCJqdGkiOiIwNjU3MGVlNGI0MDdhZTY3NjI3ZDMwZmRhNjc0Mzk3NDFjYTJhNzhlIn0.mJgfKMAZukXd5R2oDQ-zE_G7-1ey3z2M6X8y507LiA__64sjb0fXLMCJBn5mEqjl6g2ajX0Bs3cVyfP44XZmxC0NtmDlqKdBr4aBfURZXoZnghWGlGbYvawqJUmIjOCtb8fXVFWLpNhFkBeOeoI6GLu0MlDbWgVsOl311EN80me1cL1Q6Go7JQfTLEEkT4CgHfvJe01IAg-J4AoWk7uYPVYCX6QstbJoxDGOfFJ70CeOMnGxqC4kbrbS7EN62h_4H2vVsB_3XUAY0AgcpW37hmqjMzd0K6lC2dkAT6AFSBV4w3-fXDfeyCPFtduc4wR0rQ74mH2OCbdsDJ8ea6jcSQ',
            'muhxddmpfRGeShdrHdW82LuvMB7',
            '0x7ec0f7dedc2540a71b32d43d9974094ea16451e70e8e413f69a320508ba608c0'
        )
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
            output.username = authRecord.username;
            output.authId = authRecord.suiWallet;
            output.status = 'exists';
        }

        if (referralCode) {
            const referral: IReferralCode = await this.referralRepo.getReferralCode(referralCode);
            if (referral) {
                console.log(referral);
                output.referralBeatmap = referral.beatmapId;
            }
            else
                console.log('referral not found');
        }

        //add nonce token
        if (output.authId && output.authId.length) this.noncesToWallets[nonceToken] = output.authId;

        return output;
    }
}
