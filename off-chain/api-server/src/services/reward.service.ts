import { Inject, Injectable, } from '@nestjs/common';
import { IRewardRepo } from '../repositories/reward/IReward';
import { ConfigSettings } from '../config';
import { ConfigSettingsModule, RewardsModule } from '../app.module';

@Injectable()
export class RewardService {
    rewards: IRewardRepo;
    config: ConfigSettings;

    constructor(
        @Inject('ConfigSettingsModule') configSettingsModule: ConfigSettingsModule,
        @Inject('RewardsModule') rewardsModule: RewardsModule,
    ) {
        this.config = configSettingsModule.get();
        this.rewards = rewardsModule.get(this.config);
    }

    async getAllRewards(): Promise<any> {
        const output = await this.rewards.getAllRewards();

        return output;
    }

    async getRewardByType(type: string): Promise<any> {
        const output = await this.rewards.getRewardByType(type);

        return output;
    }

    async updateReward(type: string, reward: string): Promise<any> {
        const output = await this.rewards.updateReward(type, reward);

        return output;
    }

}



