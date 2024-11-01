import {
    Body,
    Controller,
    Get,
    Post,
    Put,
    Query,
    HttpCode,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { AppLogger } from '../app.logger';
import { ReferralService } from 'src/services/referral.service';
import { returnError } from 'src/util/return-error';

@Controller()
export class ReferralController {
    logger: AppLogger;

    constructor(
        private readonly referralService: ReferralService,
    ) {
        this.logger = new AppLogger('referral.controller');
    }

    @Get('/')
    healthcheck() {
        return 'ok';
    }

    @ApiOperation({ summary: 'Post a new referral code' })
    @Post('/api/v2/referral')
    @HttpCode(201)
    async generateReferralCode(@Body() body: { beatmapId: string }): Promise<{ code: string, short_code: string }> {

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
            short_code: referralCode?.short_code,
            code: referralCode?.code
        };
    }
}
