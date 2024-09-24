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
    async generateReferralCode(@Body() body: { authId: string }): Promise<{ code: string }> {

        const logString = `POST /api/v2/referral ${JSON.stringify(body)}`;
        this.logger.log(logString);
        const { authId } = body;

        if (!authId || authId == '') {
            returnError(logString, 400, 'authId cannot be null or empty');
        }

        try {
            return {
                code: (await this.referralService.generateReferralToken(authId))
            };
        } catch (e) {
            returnError(logString, 500, e);
        }
    }
}
