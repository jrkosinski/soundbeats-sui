import { IConfigSettings } from 'src/config';
import { DynamoDbAccess } from '../dataAccess/DynamoDbAccess';
import { Injectable } from '@nestjs/common';
import { IReward, IRewardRepo } from './IReward';
import { ILocalBeatmap } from '../localBeatmaps/ILocalBeatmaps';
import { IDynamoResult } from '../dataAccess/IDynamoResult';


@Injectable()
export class RewardDynamoDb implements IRewardRepo {
    dynamoDb: DynamoDbAccess;
    config: IConfigSettings;

    constructor(configSettings: IConfigSettings) {
        this.dynamoDb = new DynamoDbAccess();
        this.config = configSettings;
    }

    async getAllRewards(): Promise<any> {
        return this._scanForRewards()
    }

    async updateReward(
        type: string,
        reward: string
    ): Promise<any> {
        const record: any = await this.getRewardByType(type);

        if (!record.data) {
            throw new Error(`not found.`);
        }

        return  await this._dataAccess_putRecord(type, reward, record.data);
    }

    _mapRecord(record: any): IReward {
        if (!record) return null;

        const data = record;

        return {
            type: data.type?.S ?? '',
            reward: data.reward?.S ?? '',
        };
    }


    async getRewardByType(type: any): Promise<any> {
        try {
            console.log('getting Reward by', type);
            return await this._dataAccess_getLocalBeatmap(type);
        } catch (e) {
            throw new Error(`not found.`);
        }
    }

    async _dataAccess_getLocalBeatmap(type: string): Promise<IDynamoResult> {
        const allRewards = await this.getAllRewards();
        const reward = allRewards.find((b) => b.type === type);

        if(!reward) {
            throw new Error(`not found.`);
        }

        return {
            success: reward ? true : false,
            data: reward,
            error: null,
        };
    }

    private async _scanForRewards(): Promise<IReward[]> {
        const result = await this.dynamoDb.scanTable(this.config.rewardsTableName);
        if (result.success) {
            const sortedItems = result.data; //.sort((a, b) => parseInt(b.score.N) - parseInt(a.score.N));
            return sortedItems.map((i) =>
                this._mapRecord(i)
            );
        }

        return [];
    }

    async _dataAccess_putRecord(
        type: string,
        reward: string,
        record: IReward
    ): Promise<IReward> {

        if(record.type != type && type) {
            record.type = type
        }
        if(record.reward != reward && reward) {
            record.reward = reward
        }

        const result = await this.dynamoDb.putItem({
            TableName: this.config.rewardsTableName,
            Item: {
                type: { S: record.type },
                reward: { S: record.reward },
            },
        });

        if (result.success) {
            return this._mapRecord(result.data.Item);
        }
    }
}
