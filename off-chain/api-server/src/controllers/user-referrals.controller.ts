import {
    Controller,
    Get,
    Query,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { AppLogger } from '../app.logger';
import { returnError } from 'src/util/return-error';
import { GetUserReferralsDto } from '../entity/req.entity';
import { UserReferralService } from '../services/user-refferal.service';
import { IUserReferral } from '../repositories/userReferrals/IUserReferralsManager';

@Controller()
export class UserReferralsController {
    logger: AppLogger;

    constructor(
        private readonly userReferralService: UserReferralService,
    ) {
        this.logger = new AppLogger('referral.controller');
    }

    @ApiOperation({ summary: 'Gets list of user referrals' })
    @Get('/api/v2/user-referrals')
    async getNfts(@Query() query: GetUserReferralsDto): Promise<IUserReferral[]> {
        const logString = `GET /api/v2/user-referrals`;

        let { authId } = query;

        if (!authId || authId == '') {
            returnError(this.logger, logString, 400, 'recipient cannot be null or empty');
        }

        try {
            const output: IUserReferral[] = await this.userReferralService.getAllUserReferrals(authId)
            this.logger.log(`${logString} returning ${JSON.stringify(output)}`);

            return output;
        } catch (e) {
            returnError(this.logger, logString, 500, e);
        }
    }
}
