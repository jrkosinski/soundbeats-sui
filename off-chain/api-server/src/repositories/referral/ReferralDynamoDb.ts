import { IDynamoResult } from '../dataAccess/IDynamoResult';
import { Config, IConfigSettings } from 'src/config';
import { DynamoDbAccess } from '../dataAccess/DynamoDbAccess';
import { IReferralCode, IReferralRepo } from './IReferralManager';
import { ethers } from 'ethers';

function getTimestamp() {
    return Math.floor(Date.now() / 1000);
}

export class ReferralDynamoDb implements IReferralRepo {
    network: string;
    dynamoDb: DynamoDbAccess;
    config: IConfigSettings;

    constructor(configSettings: IConfigSettings) {
        this.config = configSettings;
        this.dynamoDb = new DynamoDbAccess();
    }

    async exists(code: string): Promise<boolean> {
        const beatmap = await this.getReferralCode(code);
        return beatmap?.code === code;
    }

    async getReferralCode(code: string): Promise<IReferralCode> {
        return await this._dataAccess_getReferral(code);
    }

    async generateReferralCode(beatmapId: string): Promise<IReferralCode> {
        let randomCode = this._getRandomString(5).toLowerCase();
        while (await this.exists(randomCode)) {
            randomCode = this._getRandomString(5).toLowerCase();
        }

        const output = {
            beatmapId: beatmapId,
            code: randomCode,
            generatedAt: getTimestamp(),
            lastRedeemedAt: 0,
            maxUses: 0,
            uses: 0,
        };

        await this.updateReferralCode(output);

        return output;
    }

    async updateReferralCode(referralCode: IReferralCode): Promise<void> {
        await this._dataAccess_putReferral(referralCode);
    }

    //data access methods

    _mapRecord(record: any): IReferralCode {
        if (!record) return null;

        const data = record;

        return {
            code: data.code?.S ?? '',
            beatmapId: data.beatmapId?.S ?? '',
            generatedAt: data.generatedAt?.N ?? 0,
            lastRedeemedAt: data.lastRedeemedAt?.N ?? 0,
            maxUses: data.maxUses?.N ?? 0,
            uses: data.uses?.N ?? 0,
        };
    }

    private async _dataAccess_getReferral(code: string): Promise<IReferralCode> {
        const paramsForLongCode = {
            TableName: this.config.referralTableName,
            Key: {
                code: { S: code },
            },
        };

        return this._mapRecord((await this.dynamoDb.getItem(paramsForLongCode)).data);
    }

    private async _dataAccess_putReferral(referral: IReferralCode): Promise<IDynamoResult> {
        return await this.dynamoDb.putItem({
            TableName: this.config.referralTableName,
            Item: {
                code: { S: referral.code },
                beatmapId: { S: referral.beatmapId },
                maxUses: { N: referral.maxUses.toString() },
                uses: { N: referral.uses.toString() },
                generatedAt: { N: referral.generatedAt.toString() },
                lastRedeemedAt: { N: referral.lastRedeemedAt.toString() },
            },
        });
    }

    private _getRandomString(length: any): string {
        let result = '';
        const characters = 'abcdefghijklmnpqrstuvwxyz023456789';
        for (let i = 0; i < length; i++) {
            const randomInd = Math.floor(Math.random() * characters.length);
            result += characters.charAt(randomInd);
        }
        return result;
    }
}
