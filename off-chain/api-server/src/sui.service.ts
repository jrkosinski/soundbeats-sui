import {
    RawSigner, // use keypair
} from '@mysten/sui.js';
import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { Ed25519Keypair, Ed25519PublicKey } from '@mysten/sui.js/keypairs/ed25519';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { Keypair, Signer } from '@mysten/sui.js/cryptography';
import { Injectable } from '@nestjs/common';
import { ILeaderboard, ISprint } from './leaderboard/ILeaderboard';
import { getLeaderboardInstance } from './leaderboard/leaderboard';
import { IAuthManager, IAuthRecord, IAuthSession } from './auth/IAuthManager';
import { getAuthManagerInstance } from './auth/auth';
import { Config } from './config';
import { AppLogger } from './app.logger';
const { ethers } = require('ethers');

//TODO: replace 'success' with 'completed'
// - delete table
// - rename 2 props & create
/// - rename in code
// - retest
//TODO: logging msgs

export const strToByteArray = (str: string): number[] => {
    const utf8Encode = new TextEncoder();
    return Array.from(utf8Encode.encode(str).values());
};

@Injectable()
export class SuiService {
    signer: RawSigner;
    provider: SuiClient;
    keypair: Keypair;
    treasuryCap: string;
    beatsNftOwnerCap: string;
    beatmapsNftOwnerCap: string;
    leaderboard: ILeaderboard;
    authManager: IAuthManager;
    network: string;
    logger: AppLogger;
    noncesToWallets: { [key: string]: string };

    constructor() {
        //derive keypair
        this.keypair = Ed25519Keypair.deriveKeypair(process.env.MNEMONIC_PHRASE);
        this.noncesToWallets = {};
        this.logger = new AppLogger('sui.service');

        //create connect to the correct environment
        this.network = Config.suiNetwork;
        this.logger.log(`network: ${this.network}`);
        this.provider = this._createRpcProvider(this.network);
        this.signer = new RawSigner(this.keypair, this.provider);

        //leaderboard
        this.leaderboard = getLeaderboardInstance(this.network);
        this.authManager = getAuthManagerInstance();

        //get initial addresses from config setting
        this.treasuryCap = Config.treasuryCap;
        this.beatsNftOwnerCap = Config.beatsNftOwnerCap;
        this.beatmapsNftOwnerCap = Config.beatmapsNftOwnerCap;

        this.logger.log('BEATS token package id: ' + Config.beatsCoinPackageId);
        this.logger.log('BEATS NFT package id: ' + Config.beatsNftPackageId);
        this.logger.log('BEATMAPS NFT package id: ' + Config.beatmapsNftPackageId);
        this.logger.log('treasuryCap: ' + this.treasuryCap);
        this.logger.log('beatsNftOwnerCap: ' + this.beatsNftOwnerCap);
        this.logger.log('beatmapsNftOwnerCap: ' + this.beatmapsNftOwnerCap);

        //get admin address
        const suiAddress = this.keypair.getPublicKey().toSuiAddress();
        this.logger.log('admin address: ' + suiAddress);

        //detect token info from blockchain
        /*if (Config.detectPackageInfo) {
            this.logger.log('detecting package data ...');
            this._detectTokenInfo(suiAddress, Config.beatsNftPackageId).then(async (response) => {
                this.logger.log('parsing package data ...');
                if (response && response.packageId && response.treasuryCap) {
                    this.treasuryCap = response.treasuryCap;
                    this.beatsNftOwnerCap = response.beatsNftOwnerCap;
                    this.beatmapsNftOwnerCap = response.beatmapsNftOwnerCap;

                    this.logger.log('detected packageId: ' + response.packageId);
                    this.logger.log('detected treasuryCap: ' + this.treasuryCap);
                    this.logger.log('detected beatsNftOwnerCap: ' + this.beatsNftOwnerCap);
                    this.logger.log('detected beatmapsNftOwnerCap: ' + this.beatmapsNftOwnerCap);
                }
            });
        }*/
    }

    createWallet(): { address: string; privateKey: string } {
        const keypair = new Ed25519Keypair();
        const exported = keypair.export();

        return {
            address: keypair.toSuiAddress(),
            privateKey: exported.privateKey,
        };
    }

    //TODO: (LOW) refactor mintBeatsNfts and mintBeatmapsNfts into one method
    /**
     * Mints NFTs with the given properties in the given quantity to the specified
     * recipient wallet address.
     *
     * @param recipient
     * @param name
     * @param description
     * @param imageUrl
     * @param quantity
     * @returns MintNftResponseDto
     */
    async mintBeatsNfts(
        recipient: string,
        name: string,
        description: string,
        imageUrl: string,
        quantity: number,
    ): Promise<{ signature: string; addresses: string[]; network: string }> {
        //mint nft to recipient
        const tx = new TransactionBlock();
        tx.moveCall({
            target: `${Config.beatsNftPackageId}::beats_nft::mint`,
            arguments: [
                tx.pure(this.beatsNftOwnerCap),
                tx.pure(name),
                tx.pure(description),
                tx.pure(imageUrl),
                tx.pure(recipient),
                tx.pure(quantity),
            ],
        });

        //execute tx
        const result = await this.signer.signAndExecuteTransactionBlock({
            transactionBlock: tx,
            options: {
                showEffects: true,
                showEvents: true,
                showBalanceChanges: true,
                showObjectChanges: true,
                showInput: true,
            },
        });

        //check results
        if (result.effects == null) {
            throw new Error('Fail');
        }

        const signature = result.effects.transactionDigest;
        const addresses = result.effects.created?.map((obj) => obj.reference.objectId) ?? [];

        return { signature, addresses, network: this.network };
    }

    /**
     * Mints NFTs with the given properties in the given quantity to the specified
     * recipient wallet address.
     *
     * @param recipient
     * @param title
     * @param username
     * @param beatmapJson
     * @param quantity
     * @returns MintNftResponseDto
     */
    async mintBeatmapsNfts(
        recipient: string,
        username: string,
        title: string,
        artist: string,
        beatmapJson: string,
        imageUrl: string,
        quantity: number,
    ): Promise<{ signature: string; addresses: string[]; network: string }> {
        //mint nft to recipient
        const tx = new TransactionBlock();

        const metadata = {
            beatmap: beatmapJson,
            username: username,
            title: title,
            artist: artist,
        };

        tx.moveCall({
            target: `${Config.beatmapsNftPackageId}::beatmaps_nft::mint`,
            arguments: [
                tx.pure(this.beatmapsNftOwnerCap),
                tx.pure(JSON.stringify(metadata)),
                tx.pure(imageUrl),
                tx.pure(recipient),
                tx.pure(quantity),
            ],
        });

        //execute tx
        const result = await this.signer.signAndExecuteTransactionBlock({
            transactionBlock: tx,
            options: {
                showEffects: true,
                showEvents: true,
                showBalanceChanges: true,
                showObjectChanges: true,
                showInput: true,
            },
        });

        //check results
        if (result.effects == null) {
            throw new Error('Fail');
        }

        const signature = result.effects.transactionDigest;
        const addresses = result.effects.created?.map((obj) => obj.reference.objectId) ?? [];

        return { signature, addresses, network: this.network };
    }

    /**
     * Mints tokens in the given quantity to the specified recipient.
     *
     * @param recipient
     * @param amount
     * @returns
     */
    async mintTokens(recipient: string, amount: number): Promise<{ signature: string; network: string }> {
        //mint token to recipient
        const tx = new TransactionBlock();
        tx.moveCall({
            target: `${Config.beatsCoinPackageId}::beats::mint`,
            arguments: [tx.pure(this.treasuryCap), tx.pure(amount), tx.pure(recipient)],
        });

        //execute tx
        const result = await this.signer.signAndExecuteTransactionBlock({
            transactionBlock: tx,
            options: {
                showEffects: true,
                showEvents: true,
                showBalanceChanges: true,
                showObjectChanges: true,
            },
        });

        //check results
        if (result.effects == null) {
            throw new Error('Move call Failed');
        }

        const signature = result.effects?.transactionDigest;
        return { signature, network: this.network };
    }

    /**
     * Retrieves the balance of BEATS token from the blockchain, for the given wallet address.
     *
     * @param wallet
     * @returns GetTokenBalanceResponseDto
     */
    async getTokenBalance(wallet: string): Promise<{ balance: number; network: string }> {
        const tokenType = `${Config.beatsCoinPackageId}::beats::BEATS`;
        const result = await this.provider.getBalance({
            owner: wallet,
            coinType: tokenType,
        });
        return {
            balance: parseInt(result.totalBalance),
            network: this.network,
        };
    }

    /**
     * Examines all instances of BEATS NFTs owned by the given wallet address, and returns a list
     * of the unique NFT types owned by the address.
     *
     * @param wallet
     * @param nftType
     * @returns GetBeatsNftsResponseDto
     */
    async getBeatsNfts(wallet: string): Promise<{ nfts: any[]; network: string }> {
        const output: {
            nfts: { name: string; url: string }[];
            network: string;
        } = {
            nfts: [],
            network: this.network,
        };

        const nfts = await this._getUserNFTs(wallet);

        //get list of unique names for all NFTs owned
        for (let i = 0; i < nfts.length; i++) {
            const nft = nfts[i];
            if (nft.data.content['fields'] && nft.data.content['fields']['name'] && nft.data.content['fields']['url']) {
                const nftName = nft.data.content['fields']['name'];
                const nftUrl = nft.data.content['fields']['url'];

                //only add if name is unique
                if (!output.nfts.some((nft) => nft.name == nftName)) {
                    output.nfts.push({ name: nftName, url: nftUrl });
                }
            }
        }
        return output;
    }

    /**
     * Examines all instances of BEATMAPS NFTs owned by the given wallet address, and returns a list
     * of the unique NFT types owned by the address.
     *
     * @param wallet
     * @param nftType
     * @returns GetBeatsNftsResponseDto
     */
    async getBeatmapsNfts(wallet: string): Promise<{ nfts: any[]; network: string }> {
        const output: {
            nfts: {
                username: string;
                title: string;
                artist: string;
                beatmapJson: string;
            }[];
            network: string;
        } = { nfts: [], network: this.network };

        const nfts = await this._getUserNFTs(wallet, 'BEATMAPS_NFT');

        //get list of unique names for all NFTs owned
        for (let i = 0; i < nfts.length; i++) {
            const nft = nfts[i];
            if (nft.data.content['fields'] && nft.data.content['fields']['metadata']) {
                let metadata: any = {};
                try {
                    metadata = JSON.parse(nft.data.content['fields']['metadata']);
                } catch {}
                output.nfts.push({
                    username: metadata.username ?? '',
                    artist: metadata.artist ?? '',
                    title: metadata.title ?? '',
                    beatmapJson: metadata.beatmap ?? '',
                });
            }
        }
        return output;
    }

    /**
     * Returns the leaderboard score of the given wallet (default 0).
     *
     * @param wallet the wallet address to query score
     * @param sprint unique sprint id, or "current", "", or "default"
     * @returns LeaderboardDto
     */
    async getLeaderboardScore(
        wallet: string,
        sprint: string | null | 'current' | '' = null,
    ): Promise<{
        wallet: string;
        score: number;
        username: string;
        network: string;
    }> {
        return await this.leaderboard.getLeaderboardScore(wallet, sprint);
    }

    /**
     * Returns all leaderboard scores, or the leaderboard score of the given wallet only,
     * if the wallet parameter is provided (i.e., if 'wallet' is null or undefined, returns ALL scores)
     *
     * @param limit 0 means 'unlimited'
     * @param sprint unique sprint id, or "current", "", or "default"
     * @returns GetLeaderboardResponseDto
     */
    async getLeaderboardScores(
        limit: number = 0,
        sprint: string | null | 'current' | '' = null,
    ): Promise<{
        scores: { wallet: string; username: string; score: number }[];
        network: string;
    }> {
        return await this.leaderboard.getLeaderboardScores(limit, sprint);
    }

    /**
     * Adds a new leaderboard score for the given wallet address.
     *
     * @param wallet the wallet address to add score
     * @param score the score to add for the given wallet
     * @param sprint unique sprint id, or "current", "", or "default"
     * @returns LeaderboardDto
     */
    async addLeaderboardScore(
        authId: string,
        score: number,
        sprint: string | null | 'current' | '' = null,
    ): Promise<{ score: number; network: string }> {
        const user = await this.getAccountFromLogin(authId);
        let username = authId;
        if (user) {
            username = user.username;
        }
        return await this.leaderboard.addLeaderboardScore(authId, username, score, sprint);
    }

    /**
     * Gets the specified leaderboard sprint configuration, if it exists.
     *
     * @param sprintId
     * @returns The given sprint configuration, if found; otherwise null.
     */
    async getLeaderboardSprint(sprintId: string): Promise<ISprint> {
        return await this.leaderboard.getSprint(sprintId);
    }

    /**
     * Gets all leaderboard sprints.
     *
     * @param limit Max number of records to return; <=0 for unlimited.
     * @returns An array of leaderboard sprints that exist.
     */
    async getLeaderboardSprints(limit: number = 0): Promise<ISprint[]> {
        return await this.leaderboard.getSprints(limit);
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

    /**
     * From objects owned by the admin wallet, extracts the package id and object id of the
     * BEATS token and NFT library.
     *
     * @param wallet
     * @returns A package id and treasury cap id
     */
    async _detectTokenInfo(
        wallet: string,
        packageId: string = null,
    ): Promise<{
        packageId: string;
        treasuryCap: string;
        beatsNftOwnerCap: string;
        beatmapsNftOwnerCap: string;
    } | null> {
        let output = null;

        //get owned objects
        const objects = await this.provider.getOwnedObjects({
            owner: wallet,
            options: {
                showType: true,
                showContent: true,
                showOwner: true,
            },
        });

        for (let i in objects.data) {
            const obj = objects.data[i];
        }

        //parse the objects
        if (objects && objects.data && objects.data.length) {
            const tCaps = objects.data.filter((o) => {
                return (
                    o.data.type.startsWith(`0x2::coin::TreasuryCap<${packageId ?? ''}`) &&
                    o.data?.type?.endsWith('::beats::BEATS>')
                );
            });

            if (tCaps && tCaps.length) {
                const beatsObj = tCaps[0];

                //parse out the type to get the package id
                if (!packageId) {
                    let parts = beatsObj.data.type.split('::');
                    let tCap = parts.filter((p) => p.startsWith('TreasuryCap<'));
                    if (tCap.length) {
                        packageId = tCap[tCap.length - 1].substring('TreasuryCap<'.length);
                    }
                }

                if (packageId && packageId.length) {
                    //get BEATS nft owner object
                    let beatsNftObj = null;
                    const beatsNftOwners = objects.data.filter((o) => {
                        return (
                            o.data.type == `${packageId}::beats_nft::BeatsOwnerCap<${packageId}::beats_nft::BEATS_NFT>`
                        );
                    });
                    if (beatsNftOwners && beatsNftOwners.length) {
                        beatsNftObj = beatsNftOwners[beatsNftOwners.length - 1];
                    }

                    //get BEATMAPS nft owner object
                    let beatmapsNftObj = null;
                    const beatmapsNftOwners = objects.data.filter((o) => {
                        return (
                            o.data.type ==
                            `${packageId}::beatmaps_nft::BeatmapsOwnerCap<${packageId}::beatmaps_nft::BEATMAPS_NFT>`
                        );
                    });
                    if (beatmapsNftOwners && beatmapsNftOwners.length) {
                        beatmapsNftObj = beatmapsNftOwners[beatmapsNftOwners.length - 1];
                    }

                    //get coin cap object
                    let coinObj = null;
                    const coinCaps = objects.data.filter((o) => {
                        return o.data.type == `0x2::coin::CoinMetadata<${packageId}::beats::BEATS>`;
                    });
                    if (coinCaps && coinCaps.length) {
                        coinObj = coinCaps[coinCaps.length - 1];
                    }

                    //get package ID & treasury cap
                    if (packageId && packageId.length) {
                        output = {
                            packageId: packageId,
                            treasuryCap: beatsObj.data?.objectId,
                            beatsNftOwnerCap: beatsNftObj?.data?.objectId,
                            beatmapsNftOwnerCap: beatmapsNftObj?.data?.objectId,
                        };
                    }
                }
            }
        }

        return output;
    }

    /**
     * Creates a Json RPC provider for the given environment (default devnet)
     *
     * NOTE: it's not about what you wear; it's all about where you are
     * @param environment
     * @returns JsonRpcProvider
     */
    _createRpcProvider(environment: string): SuiClient {
        if (!environment) environment = 'DEVNET';

        this.logger.log(`creating RPC provider for ${environment}`);

        switch (environment.toUpperCase()) {
            case 'LOCALNET':
                return new SuiClient({
                    url: getFullnodeUrl('localnet'),
                });
            case 'DEVNET':
                return new SuiClient({
                    url: getFullnodeUrl('devnet'),
                });
            case 'TESTNET':
                return new SuiClient({
                    url: getFullnodeUrl('testnet'),
                });
            case 'MAINNET':
                return new SuiClient({
                    url: getFullnodeUrl('mainnet'),
                });
        }

        return new SuiClient({
            url: getFullnodeUrl('devnet'),
        });
    }

    /**
     * Generically used to get NFTs of a given kind, belonging to a specific owner.
     * @param wallet The NFT owner
     * @param nftType NFT package id string
     * @returns
     */
    async _getUserNFTs(wallet: string, nftType: string = 'BEATS_NFT'): Promise<any[]> {
        let output: any[] = [];

        //get objects owned by user
        let response: any = {
            hasNextPage: true,
            data: [],
            nextCursor: null,
        };

        while (response.hasNextPage) {
            //get objects owned by user
            response = await this.provider.getOwnedObjects({
                owner: wallet,
                options: {
                    showType: true,
                    showContent: true,
                },
                limit: 50,
                cursor: response.nextCursor,
            });

            if (response && response.data && response.data.length) {
                let packageId: string = '';
                if (nftType.toLowerCase() == 'beats_nft') packageId = Config.beatsNftPackageId;
                if (nftType.toLowerCase() == 'beatmaps_nft') packageId = Config.beatmapsNftPackageId;

                //get objects which are the named NFTs
                const beatsNfts = response.data.filter((o) => {
                    return (
                        o.data?.type?.startsWith(packageId) &&
                        o.data?.type?.endsWith(`::${nftType.toLowerCase()}::${nftType.toUpperCase()}>`)
                    );
                });

                if (beatsNfts?.length) output = beatsNfts;
            }
        }

        return output;
    }
}
