import { ILocalBeatmapsRepo, ILocalBeatmap } from './ILocalBeatmaps';
import { IDynamoResult } from '../dataAccess/IDynamoResult';
import { IConfigSettings } from 'src/config';
import { DynamoDbAccess } from '../dataAccess/DynamoDbAccess';
import { v4 as uuidv4 } from 'uuid';

const GSI_OWNER_NAME = 'GSI_OWNER';

export class LocalBeatmapsDynamoDb implements ILocalBeatmapsRepo {
    network: string;
    dynamoDb: DynamoDbAccess;
    config: IConfigSettings;

    constructor(configSettings: IConfigSettings) {
        this.config = configSettings;
        this.dynamoDb = new DynamoDbAccess();
    }

    async getAllLocalBeatmaps(): Promise<ILocalBeatmap[]> {
        return await this._scanForLocalBeatmaps();
    }

    async getLocalBeatmap(id: any): Promise<any> {
        try {
            console.log('getting local beatmap by', id);
            return await this._dataAccess_getLocalBeatmap(id);
        } catch (e) {
            console.log(e);
            throw new Error(`not found.`);
        }
    }

    async updateLocalBeatmap(
        id: any,
        username: string,
        title: string,
        file: string,
        artist: string
    ): Promise<any> {
        const record: any = await this.getLocalBeatmap(id);

        if (!record.data) {
            throw new Error(`not found.`);
        }

        return  await this._dataAccess_putRecord(username, artist, title, file, record.data);
    }

    async getLocalBeatmapsByOwner(ownerAddress: string): Promise<ILocalBeatmap[]> {
        return await this._scanForLocalBeatmapsByOwner(ownerAddress);
    }

    async addLocalBeatmap(beatmap: ILocalBeatmap): Promise<void> {
        await this._dataAccess_putBeatmap(beatmap);
    }

    //data access methods

    _mapRecord(record: any): ILocalBeatmap {
        return {
            id: record.id?.S ?? '',
            timestamp: record.timestamp?.N ?? 0,
            username: record.username?.S ?? '',
            artist: record.artist?.S ?? '',
            title: record.title?.S ?? '',
            file: record.file?.S ?? '',
        };
    }

    private async _scanForLocalBeatmapsByOwner(owner: string): Promise<ILocalBeatmap[]> {
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

    async _dataAccess_putRecord(
        username: string,
        artist: string,
        title: string,
        file: string,
        record: ILocalBeatmap
    ): Promise<ILocalBeatmap> {

        if(record.username != username && username) {
            record.username = username
        }
        if(record.artist != artist && artist) {
            record.artist = artist
        }
        if(record.title != title && title) {
            record.title = title
        }
        if(record.file != file && file) {
            record.file = JSON.stringify(file)
        }

        const result = await this.dynamoDb.putItem({
            TableName: process.env.DBTABLE_LOCAL_BEATMAP,
            Item: {
                id: { S: record.id },
                username: { S: record.username },
                title: { S: record.title },
                file: { S: record.file },
                artist: { S: record.artist }
            },
        });

        if (result.success) {
            return this._mapRecord(result.data.Item);
        }
    }


    private async _scanForLocalBeatmaps(): Promise<ILocalBeatmap[]> {
        const result = await this.dynamoDb.scanTable(this.config.localBeatmapsTableName);
        if (result.success) {
            const sortedItems = result.data; //.sort((a, b) => parseInt(b.score.N) - parseInt(a.score.N));
            return sortedItems.map((i) => this._mapRecord(i));
        }

        return [];
    }

    async _dataAccess_getLocalBeatmap(id: string): Promise<IDynamoResult> {
        const allBeatmaps = await this.getAllLocalBeatmaps();
        const beatmap = allBeatmaps.find((b) => b.id === id);

        return {
            success: beatmap ? true : false,
            data: beatmap,
            error: null,
        };
    }

    private async _dataAccess_putBeatmap(beatmap: ILocalBeatmap): Promise<IDynamoResult> {
        const uniqueId = uuidv4();
        return await this.dynamoDb.putItem({
            TableName: this.config.localBeatmapsTableName,
            Item: {
                id: { S: uniqueId },
                title: { S: beatmap.title },
                username: { S: beatmap.username },
                file: { S: beatmap.file },
                artist: { S: beatmap.artist },
                timestamp: { N: beatmap.timestamp.toString() },
            },
        });
    }
}
