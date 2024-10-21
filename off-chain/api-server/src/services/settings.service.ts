import { Inject, Injectable } from '@nestjs/common';
import { ConfigSettings } from '../config';
import { AppLogger } from '../app.logger';
import { ConfigSettingsModule } from '../app.module';


@Injectable()
export class SettingsService {
    network: string;
    logger: AppLogger;
    config: ConfigSettings;

    constructor(
        @Inject('ConfigSettingsModule') configSettingsModule: ConfigSettingsModule,
    ) {
        this.config = configSettingsModule.get();
        this.logger = new AppLogger('settings.service');

        //create connect to the correct environment
        this.network = this.config.suiNetwork;
    }

    async getSettings(): Promise<any> {
        //TODO: store these values in config 
        return {
            perfectHit: 5,
            network: this.network,
            beatmapReferrerReward: 100,
            beatmapReferredReward: 50
        };
    }
}
