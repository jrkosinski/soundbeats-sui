import { IConfigSettings } from 'src/config';
import { DynamoDbAccess } from '../dataAccess/DynamoDbAccess';
import { Injectable } from '@nestjs/common';
import { IProfitRecord, IProfitRecordRepo } from './IProfitRecords';


@Injectable()
export class ProfitRecordsDynamoDb implements IProfitRecordRepo {
    dynamoDb: DynamoDbAccess;
    config: IConfigSettings;

    constructor(configSettings: IConfigSettings) {
        this.dynamoDb = new DynamoDbAccess();
        this.config = configSettings;
    }

    async increaseProfit(balance: number) {
        const totalProfit = await this._scanForProfitRecords();

        return await this._dataAccess_putProfitRecords(totalProfit[0].profit + balance);
    }

    _mapRecord(record: any): IProfitRecord {
        if (!record) return null;
        const data = record;
        return {
            profit: Number(data.profit?.N ?? 0)
        };
    }

    private async _scanForProfitRecords(): Promise<IProfitRecord[]> {
        const result = await this.dynamoDb.scanTable(this.config.profitRecordsTableName);
        if (result.success) {
            const sortedItems = result.data;
            return sortedItems.map((i) =>
                this._mapRecord(i)
            );
        }

        return [];
    }

    private async _dataAccess_putProfitRecords(profit: number): Promise<IProfitRecord> {
        let result = await this.dynamoDb.putItem({
            TableName: this.config.profitRecordsTableName,
            Item: {
                type: { S: "total" },
                profit: { N: profit.toString() },
            },
        });

        if (result.success) {
            return this._mapRecord(result.data.Item);
        }
    }



}
