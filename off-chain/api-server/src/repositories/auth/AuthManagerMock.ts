import { Injectable } from '@nestjs/common';
import { IAuthManager, IAuthRecord, IAuthSession } from './IAuthManager';
import { IConfigSettings } from 'src/config';

@Injectable()
export class AuthManagerMock implements IAuthManager {
    config: IConfigSettings;
    accountMap: Map<string, any>;
    sessionMap: Map<string, any>;
    usernameMap: Map<string, string>;

    constructor(configSettings: IConfigSettings) {
        this.config = configSettings;
    }

    async registerUser(
        authId: string,
        authType: 'evm' | 'sui',
        suiWallet: string,
        username: string,
        extraData: any,
        referralCode?: string
    ): Promise<boolean> {
        return true;
    }

    private getId(authId: string, authType: 'evm' | 'sui') { return `${authId}|${authType}`; }

    async exists(authId: string, authType: 'evm' | 'sui'): Promise<boolean> {
        return this.accountMap.has(this.getId(authId, authType));
    }

    async usernameExists(username: string): Promise<boolean> {
        return this.usernameMap.has(username);
    }

    async getAuthRecord(authId: string, authType: 'evm' | 'sui'): Promise<IAuthRecord> {
        return (this.exists(authId, authType)) ?
            this.accountMap[this.getId(authId, authType)]
            : null;
    }

    async getAuthRecords(): Promise<IAuthRecord[]> {
        return [];
    }

    async updateAuthRecord(authId: string, authType: 'evm' | 'sui', suiWallet: string, level: number): Promise<void> {
        if (this.exists(authId, authType)) {

        }
    }

    async setSuiWalletAddress(authId: string, authType: 'evm' | 'sui', suiAddress: string): Promise<boolean> {
        if (this.exists(authId, authType)) {

        }
        return true;
    }

    async startAuthSession(evmWallet: string): Promise<{ sessionId: string; messageToSign: string }> {
        return { sessionId: '', messageToSign: '' };
    }

    async updateAuthSession(sessionId: string, evmWallet: string, suiWallet: string, success: boolean): Promise<void> {
    }

    async getAuthSession(sessionId: string): Promise<IAuthSession> {
        return {
            sessionId: '',
            suiWallet: '',
            message: '',
            evmWallet: '',
            success: true,
            startTimestamp: 0,
            updateTimestamp: 0,
        };
    }

    async getUniqueWalletAddresses(): Promise<string[]> {
        const authRecords: IAuthRecord[] = await this.getAuthRecords();
        const output: string[] = [];

        for (let auth of authRecords) {
            if (auth.suiWallet?.length) {
                output.push(auth.suiWallet);
            }
            else if (auth.authType === 'sui' && auth.authId?.length) {
                output.push(auth.authId);
            }
        }
        return output;
    }
}
