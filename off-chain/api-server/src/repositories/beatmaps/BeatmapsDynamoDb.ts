import { IBeatmapsRepo, IBeatmap } from './IBeatmaps';
import { IDynamoResult } from '../dataAccess/IDynamoResult';
import { Config, IConfigSettings } from 'src/config';
import { DynamoDbAccess } from '../dataAccess/DynamoDbAccess';

const GSI_OWNER_NAME = 'GSI_OWNER';
const GSI_BEATMAP_ADDRESS = 'GSI_BEATMAP_ADDRESS';

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
        return await this._dataAccess_getBeatmap(address);
    }

    async getBeatmapsByOwner(ownerAddress: string): Promise<IBeatmap[]> {
        return await this._scanForBeatmapsByOwner(ownerAddress);
    }

    async addBeatmap(beatmap: IBeatmap): Promise<void> {
        await this._dataAccess_putBeatmap(beatmap);
    }

    async exists(address: string): Promise<boolean> {
        const beatmap = await this.getBeatmap(address);
        return beatmap?.address === address;
    }

    //data access methods

    _mapRecord(record: any): IBeatmap {
        let source = '';
        let imageUrl = '';
        try {
            if (record.json?.S) {
                const json = JSON.parse(record.json.S);
                source = json.source ?? '';
                imageUrl = json.imageUrl ?? '';
            }
        } catch (e: any) {}

        return {
            address: record.address?.S ?? '',
            owner: record.owner?.S ?? '',
            timestamp: record.timestamp?.N ?? 0,
            json: record.json?.S ?? '',
            username: record.username?.S ?? '',
            title: record.title?.S ?? '',
            artist: record.artist?.S ?? '',
            imageUrl,
            source,
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
                '#owner': 'owner',
            },
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
            IndexName: GSI_BEATMAP_ADDRESS,
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
            return sortedItems.map((i) => this._mapRecord(i));
        }

        return [];
    }

    private async _dataAccess_getBeatmap(address: string): Promise<IBeatmap> {
        const beatmaps = await this._scanForBeatmapsByAddress(address);
        return beatmaps?.length ? beatmaps[0] : null;
        /*
        return await this.dynamoDb.getItem({
            TableName: this.config.beatmapsTableName,
            Key: {
                address: { S: address },
                owner: {}
            },
        });
        */
    }

    private async _dataAccess_putBeatmap(beatmap: IBeatmap): Promise<IDynamoResult> {
        if (beatmap.json) {
            try {
                const json = JSON.parse(beatmap.json);
                if (beatmap.source) json.source = beatmap.source;
                if (beatmap.imageUrl) json.imageUrl = beatmap.imageUrl;
                beatmap.json = JSON.stringify(json);
            } catch (e: any) {}
        }
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
