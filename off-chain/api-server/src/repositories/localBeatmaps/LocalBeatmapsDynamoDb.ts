import { ILocalBeatmapsRepo, ILocalBeatmap } from './ILocalBeatmaps';
import { IDynamoResult } from '../dataAccess/IDynamoResult';
import { Config, IConfigSettings } from 'src/config';
import { DynamoDbAccess } from '../dataAccess/DynamoDbAccess';
import { IAuthRecord } from '../auth/IAuthManager';
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
            throw new Error(`not found.`);
        }
    }

    async updateLocalBeatmap(id: any, username: string, artist: string, title: string, file: string): Promise<any> {
        const record: IAuthRecord = await this.getLocalBeatmap(id);

        if (!record) {
            throw new Error(`not found.`);
        }

        await this._dataAccess_putRecord(id, username, artist, title, file);
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
            file: record.title?.S ?? '',
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
        id: string,
        username: string,
        artist: string,
        title: string,
        file: string,
    ): Promise<IDynamoResult> {
        //get the core data items
        const data: any = {
            id: { S: id },
            username: { S: username },
            title: { S: title },
            artist: { S: artist },
            file: { S: file },
        };

        //write to DB & return result
        return await this.dynamoDb.putItem({
            TableName: process.env.DBTABLE_LOCAL_BEATMAP,
            Item: data,
        });
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
        console.log('getting local beatmap by', id);
        return await this.dynamoDb.getItem({
            TableName: process.env.DBTABLE_LOCAL_BEATMAP,
            Key: {
                id: { S: id },
            },
        });
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
