import { Body, Controller, Get, Post, Put, Query, HttpCode, Inject } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { AppLogger } from '../app.logger';
import { ReferralService } from 'src/services/referral.service';
import { returnError } from 'src/util/return-error';
import { IReferralCode } from '../repositories/referral/IReferralManager';
import { AuthService } from '../services/auth.service';
import { IAuthManager, IAuthRecord } from '../repositories/auth/IAuthManager';
import { AuthManagerModule, ConfigSettingsModule } from '../app.module';
import { ConfigSettings } from '../config';

@Controller()
export class ReferralController {
    logger: AppLogger;
    authManager: IAuthManager;
    config: ConfigSettings;

    constructor(private readonly authService: AuthService, private readonly referralService: ReferralService, @Inject('AuthManagerModule') authManagerModule: AuthManagerModule,         @Inject('ConfigSettingsModule') configSettingsModule: ConfigSettingsModule,
    ) {
        this.logger = new AppLogger('referral.controller');
        this.config = configSettingsModule.get();
        this.authManager = authManagerModule.get(this.config);
    }

    @Get('/')
    healthcheck() {
        return 'ok';
    }

    @ApiOperation({ summary: 'Post a new referral code' })
    @Post('/api/v2/referral')
    @HttpCode(201)
    async generateReferralCode(@Body() body: { beatmapId: string }): Promise<{ code: string }> {
        const logString = `POST /api/v2/referral ${JSON.stringify(body)}`;
        this.logger.log(logString);
        const { beatmapId } = body;

        if (!beatmapId || beatmapId == '') {
            returnError(this.logger, logString, 400, 'beatmapId cannot be null or empty');
        }

        let referralCode;
        try {
            referralCode = await this.referralService.generateReferralCode(beatmapId);
        } catch (e) {
            returnError(this.logger, logString, 500, e);
        }

        if (!referralCode?.success) {
            if (referralCode.message === 'Beatmap not found') {
                returnError(this.logger, logString, 404, `Beatmap ${beatmapId} not found`);
            }
        }

        return {
            code: referralCode?.code,
        };
    }

    //TODO: should be GET /api/v2/referral/verify/<code>
    @ApiOperation({ summary: 'Check referral code without authentication' })
    @Post('/api/v2/verify-referral')
    async checkReferralCode(
        @Body() body: { referralCode: string; authId: string },
    ): Promise<{ referralBeatmap: string }> {
        const logString = `POST /api/v2/referral ${JSON.stringify(body)}`;
        const output = { referralBeatmap: '' };
        const { referralCode, authId } = body;

        const result = await this.referralService.checkReferralCode(referralCode);

        if (result?.referralCode) {
            output.referralBeatmap = result.referralCode.beatmapId;
            const authInfo: IAuthRecord = await this.authManager.getAuthRecord(authId, 'sui');
            await this.authService.rewardReferral(result.referralCode, authInfo);
        } else {
            returnError(this.logger, logString, 404, `Referral Code ${referralCode} not found`);
        }

        return output;
    }
}
