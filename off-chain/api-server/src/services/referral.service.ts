import { Inject, Injectable } from '@nestjs/common';
import { IAuthManager } from '../repositories/auth/IAuthManager';
import { ConfigSettings } from '../config';
import { AppLogger } from '../app.logger';
import { AuthManagerModule, BeatmapsModule, ConfigSettingsModule, LeaderboardModule, ReferralModule } from '../app.module';
import { IReferralRepo } from 'src/repositories/referral/IReferralManager';
import { IBeatmapsRepo } from 'src/repositories/beatmaps/IBeatmaps';

@Injectable()
export class ReferralService {
    network: string;
    logger: AppLogger;
    authManager: IAuthManager;
    beatmapRepo: IBeatmapsRepo
    referralRepo: IReferralRepo;
    config: ConfigSettings;

    constructor(
        @Inject('ConfigSettingsModule') configSettingsModule: ConfigSettingsModule,
        @Inject('AuthManagerModule') authManagerModule: AuthManagerModule,
        @Inject('BeatmapsModule') beatmapsModule: BeatmapsModule,
        @Inject('ReferralModule') referralModule: ReferralModule,
    ) {
        this.config = configSettingsModule.get();
        this.logger = new AppLogger('referral.service');
        this.referralRepo = referralModule.get(this.config);
        this.authManager = authManagerModule.get(this.config);
        this.beatmapRepo = beatmapsModule.get(this.config);

        //create connect to the correct environment
        this.network = this.config.suiNetwork;
    }

    async generateReferralCode(beatmapId: string): Promise<{ code: string, short_code: string, message: string, success: boolean }> {
        const output = {
            code: '',
            short_code: '',
            message: '',
            success: false
        }
        //make sure that user exists
        if (!(await this.beatmapRepo.exists(beatmapId))) {
            output.message = 'Beatmap not found';
        }
        else {
            const referralCode = await this.referralRepo.generateReferralCode(beatmapId);
            output.success = referralCode?.code?.length ? true : false;
            output.code = referralCode?.code ?? '';
            output.short_code = referralCode?.shortCode ?? '';
        }

        return output;
    }
}
