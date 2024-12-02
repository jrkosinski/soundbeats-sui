import { IDynamoResult } from '../dataAccess/IDynamoResult';
import { IConfigSettings } from 'src/config';
import { DynamoDbAccess } from '../dataAccess/DynamoDbAccess';
import { IUserReferral, IUserReferralsRepo } from './IUserReferralsManager';
import { v4 as uuidv4 } from 'uuid';

function getTimestamp() {
    return Math.floor(Date.now() / 1000);
}

export class UserReferralsDynamoDb implements IUserReferralsRepo {
    network: string;
    dynamoDb: DynamoDbAccess;
    config: IConfigSettings;

    constructor(configSettings: IConfigSettings) {
        this.config = configSettings;
        this.dynamoDb = new DynamoDbAccess();
    }

    async getAllUserReferrals(authId: string): Promise<IUserReferral[]> {
        return await this._dataAccess_getUserReferral(authId);
    }

    async addAllUserReferrals(authId: string, playerId: string, beatmapReferredReward: number, beatmapReferrerReward: number, beatmapAddress: string): Promise<IUserReferral> {
        const output = {
            uuid: uuidv4(),
            beatmapAddress: beatmapAddress,
            referralOwner: authId,
            ownerReward: beatmapReferredReward,
            player: playerId,
            playerReward: beatmapReferrerReward,
            generatedAt: getTimestamp(),
            lastRedeemedAt: 0,
        }

        await this.updateUserReferralCode(output);

        return output;
    }

    async updateUserReferralCode(userReferral: IUserReferral): Promise<IUserReferral> {
        return this._mapRecord((await this._dataAccess_putUserReferral(userReferral)).data.Item);
    }

    //data access methods

    _mapRecord(record: any): IUserReferral {
        return {
            uuid: record.uuid?.S ?? '',
            beatmapAddress: record.beatmapAddress?.S ?? '',
            referralOwner: record.referralOwner?.S ?? '',
            ownerReward: record.ownerReward?.S ?? 0,
            player: record.player?.S ?? '',
            playerReward: record.playerReward?.S ?? 0,
            generatedAt: record.generatedAt?.N ?? 0,
            lastRedeemedAt: record.lastRedeemedAt?.N ?? 0,
        };
    }

    private async _dataAccess_getUserReferral(authId: string): Promise<any> {

        const params = {
            TableName: 'user-referrals',
            IndexName: 'GSI_USERREFFERALS_REFERRALOWNER',
            KeyConditionExpression: 'referralOwner = :referralOwner_val',
            ExpressionAttributeValues: {
                ':referralOwner_val': { S: authId },
            },
        };

        const result = await this.dynamoDb.query(params)

        if (result) {
            const sortedItems = result.data;
            return sortedItems.map((i) => this._mapRecord(i));
        }

        return [];

    }

    private async _dataAccess_putUserReferral(referral: IUserReferral): Promise<IDynamoResult> {
        return await this.dynamoDb.putItem({
            TableName: 'user-referrals',
            Item: {
                uuid: { S: referral.uuid },
                beatmapAddress:  { S: referral.beatmapAddress },
                referralOwner: { S: referral.referralOwner },
                ownerReward: { S: referral.ownerReward.toString() },
                player: { S: referral.player },
                playerReward: { S: referral.playerReward.toString() },
                generatedAt: { N: referral.generatedAt.toString() },
                lastRedeemedAt: { N: referral.lastRedeemedAt.toString() },
            },
        });
    }
}
