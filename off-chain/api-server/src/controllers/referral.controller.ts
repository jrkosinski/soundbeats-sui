import { Body, Controller, Get, Post, Put, Query, HttpCode } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { AppLogger } from '../app.logger';
import { ReferralService } from 'src/services/referral.service';
import { returnError } from 'src/util/return-error';
import { IReferralCode } from '../repositories/referral/IReferralManager';
import { AuthService } from '../services/auth.service';

@Controller()
export class ReferralController {
    logger: AppLogger;

    constructor(private readonly authService: AuthService, private readonly referralService: ReferralService) {
        this.logger = new AppLogger('referral.controller');
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
            await this.authService.rewardReferral(result.referralCode, authId);
        } else {
            returnError(this.logger, logString, 404, `Referral Code ${referralCode} not found`);
        }

        return output;
    }
}
