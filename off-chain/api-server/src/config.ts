export class Config {
    static get useTls(): boolean {
        return Config.getBooleanSetting(process.env.USE_TLS);
    }
    static get useCors(): boolean {
        return Config.getBooleanSetting(process.env.USE_CORS);
    }
    static get detectPackageInfo(): boolean {
        return Config.getBooleanSetting(process.env.DETECT_PACKAGE_INFO);
    }
    static get mnemonicPhrase(): string {
        return process.env.MNEMONIC_PHRASE;
    }
    static get beatsCoinPackageId(): string {
        return process.env.BEATS_COIN_PACKAGE_ID;
    }
    static get beatsNftPackageId(): string {
        return process.env.BEATS_NFT_PACKAGE_ID;
    }
    static get beatmapsNftPackageId(): string {
        return process.env.BEATMAPS_NFT_PACKAGE_ID;
    }
    static get treasuryCap(): string {
        return process.env.TREASURY_CAP;
    }
    static get beatsNftOwnerCap(): string {
        return process.env.BEATS_NFT_OWNER_CAP;
    }
    static get beatmapsNftOwnerCap(): string {
        return process.env.BEATMAPS_NFT_OWNER_CAP;
    }
    static get coinCap(): string {
        return process.env.COIN_CAP;
    }
    static get sprintsTableName(): string {
        return process.env.DBTABLE_NAME_SPRINTS;
    }
    static get scoresTableName(): string {
        return process.env.DBTABLE_NAME_SCORES;
    }
    static get authTableName(): string {
        return process.env.DBTABLE_NAME_AUTH || "auth-dev";
    }
    static get authSessionTableName(): string {
        return process.env.DBTABLE_NAME_AUTH_SESSION || "auth-session-dev";
    }
    static get allowedCorsOrigin(): string {
        return `${process.env.GAME_SERVER_DOMAIN}`;
    }
    static get listenPort(): number {
        return Config.useTls ? Config.httpsPort : Config.httpPort;
    }

    static getBooleanSetting(value: string): boolean {
        if (value) {
            value = value.trim().toLowerCase();
            return (value == "true" || value == "1" || value == "t" || value == "y" || value == "yes");
        }

        return false;
    }

    static get suiNetwork(): string {
        return process.env.SUI_NETWORK;
    }
    static get certFilePath(): string {
        return process.env.CERT_FILE_PATH;
    }
    static get keyFilePath(): string {
        return process.env.KEY_FILE_PATH;
    }
    static get httpPort(): number {
        return parseInt(process.env.HTTP_PORT);
    }
    static get httpsPort(): number {
        return parseInt(process.env.HTTPS_PORT);
    }
}

export interface IConfigSettings {
    get testMode(): boolean;
    get useTls(): boolean;
    get useCors(): boolean;
    get detectPackageInfo(): boolean;
    get mnemonicPhrase(): string;
    get beatsCoinPackageId(): string;
    get beatsNftPackageId(): string;
    get beatmapsNftPackageId(): string;
    get treasuryCap(): string;
    get beatsNftOwnerCap(): string;
    get beatmapsNftOwnerCap(): string;
    get coinCap(): string;
    get sprintsTableName(): string;
    get scoresTableName(): string;
    get beatmapsTableName(): string;
    get referralTableName(): string;
    get authTableName(): string;
    get authSessionTableName(): string;
    get allowedCorsOrigin(): string;
    get listenPort(): number;
    get suiNetwork(): string;
    get certFilePath(): string;
    get keyFilePath(): string;
    get httpPort(): number;
}

export class ConfigSettings implements IConfigSettings {
    get testMode(): boolean {
        return false;
    }
    get useTls(): boolean {
        return this.getBooleanSetting(process.env.USE_TLS);
    }
    get useCors(): boolean {
        return this.getBooleanSetting(process.env.USE_CORS);
    }
    get detectPackageInfo(): boolean {
        return this.getBooleanSetting(process.env.DETECT_PACKAGE_INFO);
    }
    get mnemonicPhrase(): string {
        return process.env.MNEMONIC_PHRASE;
    }
    get beatsCoinPackageId(): string {
        return process.env.BEATS_COIN_PACKAGE_ID;
    }
    get beatsNftPackageId(): string {
        return process.env.BEATS_NFT_PACKAGE_ID;
    }
    get beatmapsNftPackageId(): string {
        return process.env.BEATMAPS_NFT_PACKAGE_ID;
    }
    get treasuryCap(): string {
        return process.env.TREASURY_CAP;
    }
    get beatsNftOwnerCap(): string {
        return process.env.BEATS_NFT_OWNER_CAP;
    }
    get beatmapsNftOwnerCap(): string {
        return process.env.BEATMAPS_NFT_OWNER_CAP;
    }
    get coinCap(): string {
        return process.env.COIN_CAP;
    }
    get sprintsTableName(): string {
        return process.env.DBTABLE_NAME_SPRINTS;
    }
    get scoresTableName(): string {
        return process.env.DBTABLE_NAME_SCORES;
    }
    get beatmapsTableName(): string {
        return process.env.DBTABLE_NAME_BEATMAPS;
    }
    get referralTableName(): string {
        return process.env.DBTABLE_NAME_REFERRAL;
    }
    get authTableName(): string {
        return process.env.DBTABLE_NAME_AUTH || "auth-dev";
    }
    get authSessionTableName(): string {
        return process.env.DBTABLE_NAME_AUTH_SESSION || "auth-session-dev";
    }
    get allowedCorsOrigin(): string {
        return `${process.env.GAME_SERVER_DOMAIN}`;
    }
    get listenPort(): number {
        return this.useTls ? this.httpsPort : this.httpPort;
    }
    get suiNetwork(): string {
        return process.env.SUI_NETWORK;
    }
    get certFilePath(): string {
        return process.env.CERT_FILE_PATH;
    }
    get keyFilePath(): string {
        return process.env.KEY_FILE_PATH;
    }
    get httpPort(): number {
        return parseInt(process.env.HTTP_PORT);
    }
    get httpsPort(): number {
        return parseInt(process.env.HTTPS_PORT);
    }

    private getBooleanSetting(value: string): boolean {
        if (value) {
            value = value.trim().toLowerCase();
            return (value == "true" || value == "1" || value == "t" || value == "y" || value == "yes");
        }

        return false;
    }
}

export class TestConfigSettings implements IConfigSettings {
    get testMode(): boolean {
        return true;
    }
    get useTls(): boolean {
        return false;
    }
    get useCors(): boolean {
        return false;
    }
    get detectPackageInfo(): boolean {
        return false;
    }
    get mnemonicPhrase(): string {
        return '';
    }
    get beatsCoinPackageId(): string {
        return '';
    }
    get beatsNftPackageId(): string {
        return '';
    }
    get beatmapsNftPackageId(): string {
        return '';
    }
    get treasuryCap(): string {
        return '';
    }
    get beatsNftOwnerCap(): string {
        return '';
    }
    get beatmapsNftOwnerCap(): string {
        return '';
    }
    get coinCap(): string {
        return '';
    }
    get sprintsTableName(): string {
        return '';
    }
    get scoresTableName(): string {
        return '';
    }
    get authTableName(): string {
        return '';
    }
    get beatmapsTableName(): string {
        return '';
    }
    get referralTableName(): string {
        return '';
    }
    get authSessionTableName(): string {
        return '';
    }
    get allowedCorsOrigin(): string {
        return '';
    }
    get listenPort(): number {
        return this.useTls ? this.httpsPort : this.httpPort;
    }
    get suiNetwork(): string {
        return '';
    }
    get certFilePath(): string {
        return '';
    }
    get keyFilePath(): string {
        return '';
    }
    get httpPort(): number {
        return 80;
    }
    get httpsPort(): number {
        return 443;
    }
}