import { Inject, Injectable } from '@nestjs/common';
import { ConfigSettings } from '../config';
import { AppLogger } from '../app.logger';
import { ConfigSettingsModule, UserGameStatsModule } from '../app.module';
import { RewardService } from './reward.service';


@Injectable()
export class SettingsService {
    network: string;
    logger: AppLogger;
    userGameStats: any
    config: ConfigSettings;
    perfectHitCount: number;

    constructor(
        @Inject('ConfigSettingsModule') configSettingsModule: ConfigSettingsModule,
        @Inject('UserGameStatsModule') userGameStatsModule: UserGameStatsModule,
        private rewardService: RewardService,
    ) {
        this.perfectHitCount = 5
        this.config = configSettingsModule.get();
        this.userGameStats = userGameStatsModule.get(this.config);
        this.logger = new AppLogger('settings.service');
        this.network = this.config.suiNetwork;
    }

    async getSettings(address?: string): Promise<{
        perfectHit: number,
        beatmapReferrerReward: number,
        beatmapReferredReward: number,
        network: string
    }> {
        let referrer =  await this.rewardService.getRewardByType('referrer')
        let referred =  await this.rewardService.getRewardByType('referred')
        if(address) {
            let reward = await this.rewardService.getRewardByType('perfectHit');
            const userStats = await this.userGameStats.getUserGameStats(address);

            let perfectHit = reward && reward.data && reward.data.reward
                ? JSON.parse(reward.data.reward)
                : null;

            Object.keys(perfectHit).forEach((data, index) => {
                let firstIninterval = Number(perfectHit[data].interval.match(/(\d+)-\d+/)[1])
                let secondIninterval = Number(perfectHit[data].interval.match(/\d+-(\d+)/)[1])
                let userGameStats  = Number(userStats.data.count)

                if( firstIninterval < userGameStats && userGameStats < secondIninterval) {
                    this.perfectHitCount = perfectHit[index].param
                    return
                }
            })

        }

        return {
            perfectHit: this.perfectHitCount,
            network: this.network,
            beatmapReferrerReward: referrer.data.reward,
            beatmapReferredReward: referred.data.reward
        };
    }
}
