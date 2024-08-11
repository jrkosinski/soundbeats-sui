import { Config } from 'src/config';
import { IDynamoResult } from './IDynamoResult';
const AWS = require("aws-sdk");

export class DynamoDbAccess {
    dynamoDb: any;

    constructor() {
        AWS.config.update({
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_ACCESS_SECRET,
            region: process.env.AWS_REGION
        });
        this.dynamoDb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });
    }

    async getItem(params: any): Promise<IDynamoResult> {
        const result: IDynamoResult = await new Promise((resolve, reject) => {
            this.dynamoDb.getItem(params, (err, data) => {
                if (err) {
                    console.error(err);
                    resolve({
                        success: false,
                        error: err,
                        data: null
                    });
                } else {
                    resolve({
                        success: true,
                        error: null,
                        data: data.Item
                    });
                }
            });
        });

        return result;
    }

    async putItem(params: any): Promise<IDynamoResult> {
        const result: IDynamoResult = await new Promise((resolve, reject) => {
            this.dynamoDb.putItem(params, (err, data) => {
                if (err) {
                    console.error(err);
                    resolve({
                        success: false,
                        error: err,
                        data: params
                    });
                } else {
                    resolve({
                        success: true,
                        error: null,
                        data: params
                    });
                }
            });
        });
        return result;
    }

    async scanTable(tableName: string): Promise<IDynamoResult> {
        const params = {
            TableName: tableName
        };

        const results: any = await new Promise((resolve, reject) => {
            this.dynamoDb.scan(params, (error, data) => {
                if (error) {
                    console.error("Unable to scan the table. Error JSON:", JSON.stringify(error, null, 2));
                    resolve({
                        success: false,
                        error: error,
                        data: null
                    });
                } else {
                    resolve({
                        success: true,
                        error: null,
                        data: data.Items
                    });
                }
            });
        });

        return results;
    }

    async query(params: any): Promise<IDynamoResult> {
        const results: any = await new Promise((resolve, reject) => {
            this.dynamoDb.query(params, (error, data) => {
                if (error) {
                    console.error("Unable to scan the table. Error JSON:", JSON.stringify(error, null, 2));
                    resolve({
                        success: false,
                        error: error,
                        data: null
                    });
                } else {
                    resolve({
                        success: true,
                        error: null,
                        data: data.Items
                    });
                }
            });
        });

        return results;
    }

    async deleteItem(params: any): Promise<IDynamoResult> {
        const result: IDynamoResult = await new Promise((resolve, reject) => {
            this.dynamoDb.deleteItem(params, (err, data) => {
                if (err) {
                    console.error(err);
                    resolve({
                        success: false,
                        error: err,
                        data: params
                    });
                } else {
                    resolve({
                        success: true,
                        error: null,
                        data: params
                    });
                }
            });
        });
        return result;
    }
}