import { Module } from '@nestjs/common';

export interface IAuthRecord {
    authId: string;
    authType: 'evm' | 'sui';
    suiWallet: string;
    level: number;
    username: string;
    extraData: any;
}

export interface IAuthSession {
    sessionId: string;
    message: string;
    evmWallet: string;
    suiWallet: string;
    success: boolean;
    startTimestamp: number;
    updateTimestamp: number;
}

export interface IAuthManager {
    /**
     * Adds a new auth record to the database, if it doesn't already exist.
     *
     * @param authId
     * @param authType
     * @param suiWallet
     * @param username
     * @param extraData
     */
    registerUser(
        authId: string,
        authType: 'evm' | 'sui',
        suiWallet: string,
        username: string,
        extraData: any,
    ): Promise<boolean>;

    /**
     * Returns true if an auth record with the given id and type are in the database.
     *
     * @param authId
     * @param authType
     */
    exists(authId: string, authType: 'evm' | 'sui'): Promise<boolean>;

    /**
     * Returns true if an auth record with the given username exists in the database.
     *
     * @param username
     */
    usernameExists(username: string): Promise<boolean>;

    /**
     * Gets the record identified by the auth id and auth type.
     *
     * @param authId
     * @param authType
     */
    getAuthRecord(authId: string, authType: 'evm' | 'sui'): Promise<IAuthRecord>;

    /**
     * Gets all auth records in the database.
     */
    getAuthRecords(): Promise<IAuthRecord[]>;

    /**
     * Updates an existing auth record.
     * @param authId
     * @param authType
     * @param suiWallet
     * @param level
     */
    updateAuthRecord(authId: string, authType: 'evm' | 'sui', suiWallet: string, level: number): Promise<void>;

    /**
     * Sets the SUI wallet address associated with the identified auth record, identified
     * by auth id and auth type.
     *
     * @param authId
     * @param authType
     * @param suiAddress
     */
    setSuiWalletAddress(authId: string, authType: 'evm' | 'sui', suiAddress: string): Promise<boolean>;

    /**
     * Starts a record of an authentication attempt, creating a challenge and other data.
     *
     * @param evmWallet
     * @returns A challenge for the authenticator.
     */
    startAuthSession(evmWallet: string): Promise<{ sessionId: string; messageToSign: string }>;

    //TODO: comment
    updateAuthSession(sessionId: string, evmWallet: string, suiWallet: string, success: boolean): Promise<void>;

    //TODO: comment
    getAuthSession(sessionId: string): Promise<IAuthSession>;
}
