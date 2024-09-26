import { Inject, Injectable } from '@nestjs/common';
import { IAuthManager } from '../repositories/auth/IAuthManager';
import { ConfigSettings } from '../config';
import { AppLogger } from '../app.logger';
import { AuthManagerModule, BeatmapsModule, ConfigSettingsModule } from '../app.module';
import { IBeatmap, IBeatmapsRepo } from 'src/repositories/beatmaps/IBeatmaps';

@Injectable()
export class BeatmapsService {
    network: string;
    logger: AppLogger;
    authManager: IAuthManager;
    beatmapRepo: IBeatmapsRepo
    config: ConfigSettings;

    constructor(
        @Inject('ConfigSettingsModule') configSettingsModule: ConfigSettingsModule,
        @Inject('AuthManagerModule') authManagerModule: AuthManagerModule,
        @Inject('BeatmapsModule') beatmapsModule: BeatmapsModule,
    ) {
        this.config = configSettingsModule.get();
        this.logger = new AppLogger('beatmaps.service');
        this.authManager = authManagerModule.get(this.config);
        this.beatmapRepo = beatmapsModule.get(this.config);

        //create connect to the correct environment
        this.network = this.config.suiNetwork;
    }

    async getBeatmapById(beatmapId: string): Promise<IBeatmap> {
        return await this.beatmapRepo.getBeatmap(beatmapId);
    }

    async getBeatmaps(beatmapId: string, minted?: boolean): Promise<IBeatmap[]> {
        let beatmaps = await this.beatmapRepo.getAllBeatmaps();

        if (typeof minted !== undefined) {
            beatmaps = beatmaps.filter(b => b.minted === minted);
        }

        return beatmaps;
    }

    async saveBeatmap(beatmap: IBeatmap): Promise<IBeatmap> {
        await this.beatmapRepo.addBeatmap(beatmap);
        return beatmap;
    }
}
