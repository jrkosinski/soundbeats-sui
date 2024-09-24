import { Inject, Injectable } from '@nestjs/common';
import { IAuthManager } from '../repositories/auth/IAuthManager';
import { ConfigSettings } from '../config';
import { AppLogger } from '../app.logger';
import { AuthManagerModule, ConfigSettingsModule, LeaderboardModule, ReferralModule } from '../app.module';
import { IReferralRepo } from 'src/repositories/referral/IReferralManager';

@Injectable()
export class ReferralService {
    network: string;
    logger: AppLogger;
    authManager: IAuthManager;
    referralRepo: IReferralRepo;
    config: ConfigSettings;

    constructor(
        @Inject('ConfigSettingsModule') configSettingsModule: ConfigSettingsModule,
        @Inject('AuthManagerModule') authManagerModule: AuthManagerModule,
        @Inject('ReferralModule') referralModule: ReferralModule,
    ) {
        this.config = configSettingsModule.get();
        this.logger = new AppLogger('referral.service');
        this.referralRepo = referralModule.get(this.config);

        //create connect to the correct environment
        this.network = this.config.suiNetwork;
        this.authManager = authManagerModule.get(this.config);
    }

    async generateReferralCode(authId: string): Promise<{ code: string, message: string, success: boolean }> {
        const output = {
            code: '',
            message: '',
            success: false
        }
        //make sure that user exists
        if (!this.authManager.exists(authId, 'evm')) {
            output.message = 'user not found'
        }
        else {
            const referralCode = await this.referralRepo.generateReferralCode(authId);
            output.success = referralCode?.code.length ? true : false;
            output.code = referralCode?.code ?? '';
        }

        return output;
    }
}
