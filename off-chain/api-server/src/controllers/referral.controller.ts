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
import { NotFoundError } from 'rxjs';

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

        let referralCode;
        try {
            referralCode = await this.referralService.generateReferralCode(authId);
        } catch (e) {
            returnError(logString, 500, e);
        }

        if (!referralCode?.success) {
            if (referralCode.message === 'user not found') {
                returnError(logString, 404, `User ${authId} not found`);
            }
        } else {
            returnError(logString, 500, 'Referral code not generated: ' + referralCode?.message);
        }

        return {
            code: referralCode?.code
        };
    }
}
