import {
    RawSigner, // use keypair
} from '@mysten/sui.js';
import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { Ed25519Keypair, Ed25519PublicKey } from '@mysten/sui.js/keypairs/ed25519';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { Keypair, Signer } from '@mysten/sui.js/cryptography';
import { Inject, Injectable } from '@nestjs/common';
import { IAuthManager, IAuthRecord } from '../repositories/auth/IAuthManager';
import { ConfigSettings } from '../config';
import { AppLogger } from '../app.logger';
import { AuthManagerModule, ConfigSettingsModule } from '../app.module';
import { AuthService } from './auth.service';

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
export class TokenService {
    signer: RawSigner;
    provider: SuiClient;
    keypair: Keypair;
    treasuryCap: string;
    beatsNftOwnerCap: string;
    beatmapsNftOwnerCap: string;
    network: string;
    logger: AppLogger;
    authManager: IAuthManager;
    config: ConfigSettings;
    noncesToWallets: { [key: string]: string };

    constructor(
        @Inject('ConfigSettingsModule') configSettingsModule: ConfigSettingsModule,
        @Inject('AuthManagerModule') authManagerModule: AuthManagerModule,
    ) {
        this.config = configSettingsModule.get();

        //derive keypair
        this.keypair = Ed25519Keypair.deriveKeypair(this.config.mnemonicPhrase);
        this.logger = new AppLogger('tokens.service');

        //create connect to the correct environment
        this.network = this.config.suiNetwork;
        this.logger.log(`network: ${this.network}`);
        this.provider = this._createRpcProvider(this.network);
        this.signer = new RawSigner(this.keypair, this.provider);
        this.authManager = authManagerModule.get(this.config);

        //get initial addresses from config setting
        this.treasuryCap = this.config.treasuryCap;
        this.beatsNftOwnerCap = this.config.beatsNftOwnerCap;
        this.beatmapsNftOwnerCap = this.config.beatmapsNftOwnerCap;

        this.logger.log('BEATS token package id: ' + this.config.beatsCoinPackageId);
        this.logger.log('BEATS NFT package id: ' + this.config.beatsNftPackageId);
        this.logger.log('BEATMAPS NFT package id: ' + this.config.beatmapsNftPackageId);
        this.logger.log('treasuryCap: ' + this.treasuryCap);
        this.logger.log('beatsNftOwnerCap: ' + this.beatsNftOwnerCap);
        this.logger.log('beatmapsNftOwnerCap: ' + this.beatmapsNftOwnerCap);

        //get admin address
        const suiAddress = this.keypair.getPublicKey().toSuiAddress();
        this.logger.log('admin address: ' + suiAddress);

        //detect token info from blockchain
        /*if (this.config.detectPackageInfo) {
            this.logger.log('detecting package data ...');
            this._detectTokenInfo(suiAddress, this.config.beatsNftPackageId).then(async (response) => {
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
    ): Promise<{
        signature: string;
        addresses: string[];
        network: string;
        message: string;
        success: boolean;
    }> {
        try {
            //mint nft to recipient
            const tx = new TransactionBlock();
            tx.moveCall({
                target: `${this.config.beatsNftPackageId}::beats_nft::mint`,
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

            return {
                signature,
                addresses,
                network: this.network,
                success: true,
                message: ''
            };
        }
        catch (e) {
            return {
                signature: '',
                addresses: [],
                network: this.network,
                success: false,
                message: e.message,
            };
        }
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
    ): Promise<{
        signature: string;
        addresses: string[];
        network: string;
        message: string;
        success: boolean;
    }> {
        try {
            //mint nft to recipient
            const tx = new TransactionBlock();

            const metadata = {
                beatmap: beatmapJson,
                username: username,
                title: title,
                artist: artist,
            };

            tx.moveCall({
                target: `${this.config.beatmapsNftPackageId}::beatmaps_nft::mint`,
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

            return {
                signature,
                addresses,
                network: this.network,
                success: true,
                message: '',
            };
        } catch (e) {
            return {
                signature: '',
                addresses: [],
                network: this.network,
                success: false,
                message: e.message,
            };
        }
    }

    /**
     * Mints tokens in the given quantity to the specified recipient.
     *
     * @param recipient
     * @param amount
     * @returns
     */
    async mintTokens(
        recipient: string,
        amount: number,
    ): Promise<{
        signature: string;
        network: string;
        message: string;
        success: boolean;
        balance: number;
    }> {
        let balance = 0;
        try {
            //mint token to recipient
            const tx = new TransactionBlock();
            tx.moveCall({
                target: `${this.config.beatsCoinPackageId}::beats::mint`,
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

            try {
                balance = (await this.getTokenBalance(recipient))?.balance ?? 0;
            }
            catch (e) {
                this.logger.error(`Error getting balance of token for ${recipient}`, e);
            }

            const signature = result.effects?.transactionDigest;
            return {
                signature,
                network: this.network,
                success: true,
                message: '',
                balance
            };
        } catch (e) {
            return {
                signature: '',
                network: this.network,
                success: false,
                balance,
                message: e.message,
            };
        }
    }

    /**
     * Retrieves the balance of BEATS token from the blockchain, for the given wallet address.
     *
     * @param wallet
     * @returns GetTokenBalanceResponseDto
     */
    async getTokenBalance(wallet: string): Promise<{ balance: number; network: string }> {
        const tokenType = `${this.config.beatsCoinPackageId}::beats::BEATS`;
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
            nfts: { name: string; url: string; address: string }[];
            network: string;
        } = {
            nfts: [],
            network: this.network,
        };

        const nfts = wallet ? await this._getUserNFTs(wallet) : await this._getAllUserNFTs();

        //get list of unique names for all NFTs owned
        for (let i = 0; i < nfts.length; i++) {
            const nft = nfts[i];
            if (nft.data.content['fields'] && nft.data.content['fields']['name'] && nft.data.content['fields']['url']) {
                const nftName = nft.data.content['fields']['name'];
                const nftUrl = nft.data.content['fields']['url'];

                //only add if name is unique
                if (!output.nfts.some((nft) => nft.name == nftName)) {
                    output.nfts.push({
                        name: nftName,
                        url: nftUrl,
                        address: nft.data.objectId,
                    });
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
                address: string;
                uniqueUserCount: number;
            }[];
            network: string;
        } = { nfts: [], network: this.network };

        const nfts = wallet
            ? await this._getUserNFTs(wallet, 'BEATMAPS_NFT')
            : await this._getAllUserNFTs('BEATMAPS_NFT');

        //get list of unique names for all NFTs owned
        for (let i = 0; i < nfts.length; i++) {
            const nft = nfts[i];
            if (nft.data.content['fields'] && nft.data.content['fields']['metadata']) {
                let metadata: any = {};
                try {
                    metadata = JSON.parse(nft.data.content['fields']['metadata']);
                } catch { }
                output.nfts.push({
                    username: metadata.username ?? '',
                    artist: metadata.artist ?? '',
                    title: metadata.title ?? '',
                    beatmapJson: metadata.beatmap ?? '',
                    address: nft.data.objectId,
                    uniqueUserCount: 0
                });
            }
        }
        return output;
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
     * From objects owned by the admin wallet, extracts the package id and object id of the
     * BEATS token and NFT library.
     *
     * @param wallet
     * @returns A package id and treasury cap id
     */
    private async _detectTokenInfo(
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
    private _createRpcProvider(environment: string): SuiClient {
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
     * Generically used to get NFTs of a given kind, belonging to all owners.
     * @param nftType NFT package id string
     * @returns
     */
    private async _getAllUserNFTs(nftType: string = 'BEATS_NFT'): Promise<any[]> {
        let output: any[] = [];

        try {
            const wallets = await this.authManager.getUniqueWalletAddresses();
            const results = await Promise.all(wallets.map((a) => this._getUserNFTs(a, nftType)));
            output = results.flat();
        } catch (e) {
            this.logger.error(e.toString());
        }

        return output;
    }

    /**
     * Generically used to get NFTs of a given kind, belonging to a specific owner.
     * @param wallet The NFT owner
     * @param nftType NFT package id string
     * @returns
     */
    private async _getUserNFTs(wallet: string, nftType: string = 'BEATS_NFT'): Promise<any[]> {
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
                if (nftType.toLowerCase() == 'beats_nft') packageId = this.config.beatsNftPackageId;
                if (nftType.toLowerCase() == 'beatmaps_nft') packageId = this.config.beatmapsNftPackageId;

                console.log(response.data);

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
