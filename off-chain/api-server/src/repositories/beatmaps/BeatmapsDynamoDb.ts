import { IBeatmapsRepo, IBeatmap } from './IBeatmaps';
import { IDynamoResult } from '../dataAccess/IDynamoResult';
import { Config, IConfigSettings } from 'src/config';
import { DynamoDbAccess } from '../dataAccess/DynamoDbAccess';

const GSI_OWNER_NAME = 'GSI_OWNER';

export class BeatmapsDynamoDb implements IBeatmapsRepo {
    network: string;
    dynamoDb: DynamoDbAccess;
    config: IConfigSettings;

    constructor(configSettings: IConfigSettings) {
        this.config = configSettings;
        this.dynamoDb = new DynamoDbAccess();
    }

    async getAllBeatmaps(): Promise<IBeatmap[]> {
        return await this._scanForBeatmaps();
    }

    async getBeatmap(address: string): Promise<IBeatmap> {
        const record = await this._dataAccess_getBeatmap(address);

        return (record.success && record.data) ?
            this._mapRecord(record.data) :
            null;
    }

    async getBeatmapsByOwner(ownerAddress: string): Promise<IBeatmap[]> {
        return await this._scanForBeatmapsByOwner(ownerAddress);
    }

    async addBeatmap(beatmap: IBeatmap): Promise<void> {
        await this._dataAccess_putBeatmap(
            beatmap
        );
    }

    //data access methods

    _mapRecord(record: any): IBeatmap {
        return {
            address: record.address.S,
            owner: record.owner.S,
            timestamp: record.timestamp.N,
            json: record.json.S,
            username: record.username.S,
            title: record.title.S,
            artist: record.artist.S,
        };
    }

    private async _scanForBeatmapsByOwner(owner: string): Promise<IBeatmap[]> {
        const params = {
            TableName: this.config.beatmapsTableName,
            IndexName: GSI_OWNER_NAME,
            KeyConditionExpression: '#owner = :owner_val',
            ExpressionAttributeValues: {
                ':owner_val': { S: owner },
            },
            ExpressionAttributeNames: {
                "#owner": "owner"
            }
        };

        const result = await this.dynamoDb.query(params);
        if (result.success) {
            const sortedItems = result.data; //.sort((a, b) => parseInt(b.score.N) - parseInt(a.score.N));
            return sortedItems.map((i) => this._mapRecord(i));
        }

        return [];
    }

    private async _scanForBeatmapsByAddress(address: string): Promise<IBeatmap[]> {
        const params = {
            TableName: this.config.beatmapsTableName,
            //IndexName: GSI_OWNER_NAME,
            KeyConditionExpression: 'address = :address_val',
            ExpressionAttributeValues: {
                ':address_val': { S: address },
            },
        };

        const result = await this.dynamoDb.query(params);
        if (result.success) {
            const sortedItems = result.data; //.sort((a, b) => parseInt(b.score.N) - parseInt(a.score.N));
            return sortedItems.map((i) => this._mapRecord(i));
        }

        return [];
    }

    private async _scanForBeatmaps(): Promise<IBeatmap[]> {
        const result = await this.dynamoDb.scanTable(this.config.beatmapsTableName);
        if (result.success) {
            const sortedItems = result.data; //.sort((a, b) => parseInt(b.score.N) - parseInt(a.score.N));
            return sortedItems.map((i) =>
                this._mapRecord(i)
            );
        }

        return [];
    }

    private async _dataAccess_getBeatmap(address: string): Promise<IDynamoResult> {
        return await this.dynamoDb.getItem({
            TableName: this.config.beatmapsTableName,
            Key: {
                address: { S: address }
            },
        });
    }

    private async _dataAccess_putBeatmap(beatmap: IBeatmap): Promise<IDynamoResult> {
        return await this.dynamoDb.putItem({
            TableName: this.config.beatmapsTableName,
            Item: {
                address: { S: beatmap.address },
                owner: { S: beatmap.owner },
                json: { S: beatmap.json },
                title: { S: beatmap.title },
                username: { S: beatmap.username },
                artist: { S: beatmap.artist },
                timestamp: { N: beatmap.timestamp.toString() },
            },
        });
    }
}
