import { Injectable } from '@nestjs/common';
import { IAuthManager, IAuthRecord, IAuthSession } from './IAuthManager';

@Injectable()
export class AuthManagerMock implements IAuthManager {
    async registerUser(
        authId: string,
        authType: 'evm' | 'sui',
        suiWallet: string,
        username: string,
        extraData: any,
    ): Promise<boolean> {
        return true;
    }

    async exists(authId: string, authType: 'evm' | 'sui'): Promise<boolean> {
        return true;
    }

    async usernameExists(username: string): Promise<boolean> {
        return true;
    }

    async getAuthRecord(authId: string, authType: 'evm' | 'sui'): Promise<IAuthRecord> {
        return {
            authId: '',
            authType: 'sui',
            suiWallet: '',
            level: 0,
            username: '',
            extraData: {},
        };
    }

    async getAuthRecords(): Promise<IAuthRecord[]> {
        return [];
    }

    async updateAuthRecord(authId: string, authType: 'evm' | 'sui', suiWallet: string, level: number): Promise<void> {}

    async setSuiWalletAddress(authId: string, authType: 'evm' | 'sui', suiAddress: string): Promise<boolean> {
        return true;
    }

    async startAuthSession(evmWallet: string): Promise<{ sessionId: string; messageToSign: string }> {
        return { sessionId: '', messageToSign: '' };
    }

    async updateAuthSession(sessionId: string, evmWallet: string, suiWallet: string, success: boolean): Promise<void> {}

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
}
