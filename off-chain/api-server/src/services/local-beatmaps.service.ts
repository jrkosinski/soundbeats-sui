import { Inject, Injectable } from '@nestjs/common';
import { IAuthManager, IAuthRecord } from '../repositories/auth/IAuthManager';
import { AppLogger } from '../app.logger';
import { ConfigSettings } from '../config';
import { AuthManagerModule, ConfigSettingsModule, LeaderboardModule, LocalBeatmapsModule } from '../app.module';
import { ILocalBeatmap, ILocalBeatmapsRepo } from '../repositories/localBeatmaps/ILocalBeatmaps';
import { ILeaderboard } from '../repositories/leaderboard/ILeaderboard';
import { IBeatmapsRepo } from '../repositories/beatmaps/IBeatmaps';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { v4 as uuidv4 } from 'uuid';

function unixDate() {
    return Math.floor(Date.now() / 1000);
}

@Injectable()
export class LocalBeatmapsService {
    localBeatmap: ILocalBeatmapsRepo;
    // leaderboard: ILeaderboard;

    authManager: IAuthManager;
    network: string;
    logger: AppLogger;
    config: ConfigSettings;

    constructor(
        @Inject('ConfigSettingsModule') configSettingsModule: ConfigSettingsModule,
        @Inject('LocalBeatmapsModule') localBeatmapModule: LocalBeatmapsModule,
        @Inject('AuthManagerModule') authManagerModule: AuthManagerModule,
    ) {
        this.config = configSettingsModule.get();
        this.logger = new AppLogger('leaderboard.service');
        this.localBeatmap = localBeatmapModule.get(this.config);
        this.authManager = authManagerModule.get(this.config);
    }

    async getAllLocalBeatmaps(
    ): Promise<any> {
        return await this.localBeatmap.getAllLocalBeatmaps();
    }


    async addLocalBeatmap(
        username: string,
        title: string,
        file: string,
        // timestamp: number,
    ): Promise<{
        network: string;
        message: string;
        success: boolean;
    }> {
        try {
            //mint nft to recipient
            const tx = new TransactionBlock();


            //check results

            //add to beatmaps repository
            let message = '';
            try {

                const uniqueId = uuidv4();

                await this.localBeatmap.addLocalBeatmap({
                    id: uniqueId,
                    timestamp: unixDate(),
                    title,
                    file,
                    username,
                });
            } catch (e) {
                message = 'Minted successfully, but failed to add to database';
            }

            return {
                network: this.network,
                success: true,
                message,
            };
        } catch (e) {
            return {
                network: this.network,
                success: false,
                message: e.message,
            };
        }
    }


    async updateLocalBeatmap(
        id: any,
        username: string,
        authId: string,
        file: string,
        title: string
    ): Promise<{
        username: string;
        file: string;
        status: string;
        title: string;
    }> {
        const output = { title: '', status: '', username: '', file: '', id: '' };
        const authRecord: IAuthRecord = await this.authManager.getAuthRecord(authId, 'sui');



        if (authRecord == null) {
            output.status = 'notfound';
        } else {
            await this.localBeatmap.updateLocalBeatmap(
                id,
                username,
                title,
                file
            );


            output.username = username;
            output.file = file;
            output.title = title;
            output.status = 'success';
        }

        return output;
    }


}