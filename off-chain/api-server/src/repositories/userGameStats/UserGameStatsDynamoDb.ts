import { IConfigSettings } from 'src/config';
import { DynamoDbAccess } from '../dataAccess/DynamoDbAccess';
import { Injectable } from '@nestjs/common';
import { IDynamoResult } from '../dataAccess/IDynamoResult';
import { IUserGameStat, IUserGameStatsRepo } from './IUserGameStats';


@Injectable()
export class UserGameStatsDynamoDb implements IUserGameStatsRepo {
    dynamoDb: DynamoDbAccess;
    config: IConfigSettings;

    constructor(configSettings: IConfigSettings) {
        this.dynamoDb = new DynamoDbAccess();
        this.config = configSettings;
    }

    async getAllUsersGameStats(): Promise<any> {
        return this._scanForRewards()
    }

    async addUserGameStats(userGameStats: IUserGameStat): Promise<IUserGameStat> {
        return await this._dataAccess_putUserGameStats(userGameStats);
    }


    _mapRecord(record: any): IUserGameStat {
        if (!record) return null;

        const data = record;

        return {
            address: data.address?.S ?? '',
            count: data.count?.N ?? 0
        };
    }


    async getUserGameStats(address: any): Promise<any> {
        try {
            console.log('getting Reward by', address);
            return await this._dataAccess_getUserStats(address);
        } catch (e) {
            throw new Error(`not found.`);
        }
    }

    async _dataAccess_getUserStats(address: string): Promise<IDynamoResult> {
        const allUsersStats = await this.getAllUsersGameStats();
        const usersStats = allUsersStats.find((b) => b.address === address);

        const updatedUsersStats = await this.addUserGameStats({
            address: address,
            count: (usersStats ? Number(usersStats.count) : 0) + 1
        })


        return {
            // @ts-ignore
            success: !!updatedUsersStats,
            data: updatedUsersStats,
            error: null,
        };
    }

    private async _dataAccess_putUserGameStats(userGameStats: IUserGameStat): Promise<IUserGameStat> {
        let result = await this.dynamoDb.putItem({
            TableName: this.config.userGameStatsTableName,
            Item: {
                address: { S: userGameStats.address },
                count: { N: userGameStats.count.toString() },
            },
        });

        if (result.success) {
            return this._mapRecord(result.data.Item);
        }
    }

    private async _scanForRewards(): Promise<IUserGameStat[]> {
        const result = await this.dynamoDb.scanTable(this.config.userGameStatsTableName);
        if (result.success) {
            const sortedItems = result.data; //.sort((a, b) => parseInt(b.score.N) - parseInt(a.score.N));
            return sortedItems.map((i) =>
                this._mapRecord(i)
            );
        }

        return [];
    }
}
