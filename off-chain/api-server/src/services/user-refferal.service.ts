import { Inject, Injectable } from '@nestjs/common';
import { IAuthManager } from '../repositories/auth/IAuthManager';
import { ConfigSettings } from '../config';
import { AppLogger } from '../app.logger';
import {
    AuthManagerModule,
    BeatmapsModule,
    ConfigSettingsModule,
    UserReferralsModule,
} from '../app.module';
import { IBeatmapsRepo } from 'src/repositories/beatmaps/IBeatmaps';
import { IUserReferral, IUserReferralsRepo } from '../repositories/userReferrals/IUserReferralsManager';
import { SettingsService } from './settings.service';

@Injectable()
export class UserReferralService {
    network: string;
    logger: AppLogger;
    authManager: IAuthManager;
    beatmapRepo: IBeatmapsRepo;
    userReferralsRepo: IUserReferralsRepo;
    config: ConfigSettings;

    constructor(
        @Inject('ConfigSettingsModule') configSettingsModule: ConfigSettingsModule,
        @Inject('AuthManagerModule') authManagerModule: AuthManagerModule,
        @Inject('BeatmapsModule') beatmapsModule: BeatmapsModule,
        @Inject('UserReferralsModule') userReferralsModule: UserReferralsModule,
    ) {
        this.config = configSettingsModule.get();
        this.logger = new AppLogger('referral.service');
        this.userReferralsRepo = userReferralsModule.get(this.config);
        this.authManager = authManagerModule.get(this.config);
        this.beatmapRepo = beatmapsModule.get(this.config);
        this.network = this.config.suiNetwork;
    }

    async getAllUserReferrals(authId: string):Promise<IUserReferral[]>   {
        return  await this.userReferralsRepo.getAllUserReferrals(authId);
    }

    async addAllUserReferrals(
        ownerId: string,
        playerId: string,
        ownerEmail: string,
        playerEmail: string,
        beatmapReferredReward: number,
        beatmapReferrerReward: number,
        beatmapAddress: string,
        referralCode: string


    ): Promise<{
        success: boolean;
    }> {
        const output = {
            success: false,
        };

        await this.userReferralsRepo.addAllUserReferrals(ownerId, playerId, ownerEmail, playerEmail, beatmapReferredReward, beatmapReferrerReward, beatmapAddress, referralCode);
        output.success =  true

        return output;
    }
}
