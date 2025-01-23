import { IConfigSettings } from 'src/config';
import { IDynamoResult } from '../dataAccess/IDynamoResult';
import { DynamoDbAccess } from '../dataAccess/DynamoDbAccess';
import { Injectable } from '@nestjs/common';
import { IAdmin, IAdminRepo } from './IAdmin';
import { IReferralCode } from '../referral/IReferralManager';
import { IAuthRecord } from '../auth/IAuthManager';

const GSI_ADMIN_EMAIL = 'GSI_ADMIN_EMAIL';

@Injectable()
export class AdminDynamoDb implements IAdminRepo {
    dynamoDb: DynamoDbAccess;
    config: IConfigSettings;

    constructor(configSettings: IConfigSettings) {
        this.dynamoDb = new DynamoDbAccess();
        this.config = configSettings;
    }

    async getAllAdmins(): Promise<any> {
        return
    }


    async findByEmail(email: string): Promise<any> {
        let output: any = null;

        const existing = await this._dataAccess_getAuthRecordByEmail(email);

        if (existing.data.length) {
            output = {
                adminId: existing.data[0].adminId.S,
                email: existing.data[0].email.S,
                password: existing.data[0].password.S,
            };

            if (existing.data[0].extraData && existing.data[0].extraData.S && existing.data[0].extraData.S.length > 0) {
                output.extraData = JSON.parse(existing.data[0].extraData.S);
            }
        }

        return output;
    }



    async _dataAccess_getAuthRecordByEmail(email: string): Promise<IDynamoResult> {
        const params = {
            TableName: 'admin-dev',
            IndexName: GSI_ADMIN_EMAIL,
            KeyConditionExpression: 'email = :email',
            ExpressionAttributeValues: {
                ':email': { S: email },
            },
        };
        let result = await this.dynamoDb.query(params);
        return result;
    }


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

}
