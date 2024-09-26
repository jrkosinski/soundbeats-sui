import { Inject, Injectable } from '@nestjs/common';
import { IAuthManager } from '../repositories/auth/IAuthManager';
import { ConfigSettings } from '../config';
import { AppLogger } from '../app.logger';
import { AuthManagerModule, BeatmapsModule, ConfigSettingsModule } from '../app.module';
import { IBeatmapsRepo } from 'src/repositories/beatmaps/IBeatmaps';

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

    async generateReferralCode(beatmapId: string): Promise<{ success: boolean }> {
        return { success: true };
    }
}
