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

    async getAllLocalBeatmaps(includeFile: boolean = false): Promise<any> {
        const output = await this.localBeatmap.getAllLocalBeatmaps();
        if (output && !includeFile) {
            for (let beatmap of output) {
                delete beatmap.file;
            }
        }

        return output;
    }

    async getLocalBeatmap(id: any): Promise<any> {
        return await this.localBeatmap.getLocalBeatmap(id);
    }

    async addLocalBeatmap(
        username: string,
        artist: string,
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
                    artist,
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
        title: string,
        artist: string,
    ): Promise<{
        id: string,
        username: string;
        file: string;
        status: boolean;
        timestamp: number;
        title: string;
    }> {
        const output = { title: '', status: false, username: '', file: '', id: '', artist: '', timestamp: 0 };

        const authRecord: IAuthRecord = await this.authManager.getAuthRecord(authId, 'sui');

        if (authRecord == null) {

            output.status = false;
            return output;
        } else {
            try {
                let updatedLocalBeatmap = await this.localBeatmap.updateLocalBeatmap(
                    id,
                    username,
                    title,
                    file,
                    artist
                );
                output.id = updatedLocalBeatmap.id;
                output.username = updatedLocalBeatmap.username;
                output.file = updatedLocalBeatmap.file;
                output.title = updatedLocalBeatmap.title;
                output.artist = updatedLocalBeatmap.artist;
                output.timestamp = updatedLocalBeatmap.timestamp
                output.status = true;
                return output;

            } catch (e) {
                output.status = false;
                return output;

            }
        }
    }


}
