import { Inject, Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { IRewardRepo } from '../repositories/reward/IReward';
import { ConfigSettings } from '../config';
import { ConfigSettingsModule } from '../app.module';

@Injectable()
export class S3Service {
    rewards: IRewardRepo;
    config: ConfigSettings;
    s3: any
    constructor(
        @Inject('ConfigSettingsModule') configSettingsModule: ConfigSettingsModule,
    ) {
        this.config = configSettingsModule.get();
        this.s3 = new AWS.S3({
            accessKeyId: this.config.awsS3Settings.accessKeyId,
            secretAccessKey: this.config.awsS3Settings.secretAccessKey,
        });
    }

    async uploadFile(file) {
        return await this.s3_upload(
            file,
            this.config.awsS3Settings.bucket,
            (Math.random() + 1).toString(36).substring(7) + '.mp3',
            'audio/mpeg',
        );
    }

    async s3_upload(file: string, bucket: string, name: string, mimetype: string) {
        const params = {
            Bucket: bucket,
            Key: String(name),
            Body: file,
            ACL: 'public-read',
            ContentType: mimetype,
            ContentDisposition: 'inline',
            CreateBucketConfiguration: {
                LocationConstraint: this.config.awsS3Settings.region,
            },
        };

        try {
            let s3Response = await this.s3.upload(params).promise();
            return s3Response.Location;
        } catch (e) {
            console.log(e);
        }
    }
}