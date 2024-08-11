import {
    Body,
    Controller,
    Get,
    Post,
    Put,
    Query,
    HttpCode,
    BadRequestException,
    UnauthorizedException,
    InternalServerErrorException,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { AppService } from '../app.service';
import {
    GetLeaderboardDto,
    GetLeaderboardResponseDto,
    AddLeaderboardDto,
    AddLeaderboardResponseDto,
    GetLeaderboardSprintDto,
    GetLeaderboardSprintResponseDto,
} from '../entity/req.entity';
import { AppLogger } from '../app.logger';
import { LeaderboardService } from 'src/services/leaderboard.service';


//TODO: possible repeated code
const LEADERBOARD_DEFAULT_LIMIT: number = 100;
const MAX_WALLET_LENGTH = 100;

@Controller()
export class LeaderboardController {
    logger: AppLogger;

    constructor(private readonly appService: AppService, private readonly leaderboardService: LeaderboardService) {
        this.logger = new AppLogger('leaderboard.controller');
    }

    @Get('/')
    healthcheck() {
        return 'ok';
    }

    //TODO: REPEATED CODE
    returnError(apiCall: string, errorCode: number, message: any) {
        this.logger.error(`${apiCall} returning ${errorCode}: ${message}`);
        switch (errorCode) {
            case 400:
                throw new BadRequestException(message);
            case 401:
                throw new UnauthorizedException(message);
            case 500:
                throw new InternalServerErrorException(message);
        }

        throw new BadRequestException(message);
    }

    @ApiOperation({ summary: 'Get a user score from the leaderboard' })
    @Get('/api/v2/leaderboard')
    async getLeaderboardScore(@Query() query: GetLeaderboardDto): Promise<GetLeaderboardResponseDto> {
        const logString = `GET /api/v2/leaderboard ${JSON.stringify(query)}`;
        this.logger.log(logString);
        try {
            let { wallet, limit, sprint } = query;
            if (!wallet || wallet == '') {
                wallet = null;
            }
            if (!limit) {
                limit = LEADERBOARD_DEFAULT_LIMIT;
            }
            let output = null;
            if (wallet && wallet.length) {
                output = await this.leaderboardService.getLeaderboardScore(wallet, sprint);
            } else {
                output = await this.leaderboardService.getLeaderboardScores(limit, sprint);
            }
            this.logger.log(`${logString} returning ${JSON.stringify(output)}`);
            return output;
        } catch (e) {
            this.returnError(logString, 500, e);
        }
    }

    @ApiOperation({ summary: 'Add to a user score on the leaderboard' })
    @Post('/api/v2/leaderboard')
    @HttpCode(200)
    async addLeaderboardScore(@Body() body: AddLeaderboardDto): Promise<AddLeaderboardResponseDto> {
        const logString = `POST /api/v2/leaderboard ${JSON.stringify(body)}`;
        this.logger.log(logString);
        const { score, authId } = body;

        if (!score || score <= 0) {
            this.returnError(logString, 400, 'score cannot be null, zero or negative');
        }
        if (!authId || authId == '') {
            this.returnError(logString, 400, 'wallet cannot be null or empty');
        }
        if (authId.length > MAX_WALLET_LENGTH) {
            this.returnError(logString, 400, `wallet exceeded max length of ${MAX_WALLET_LENGTH}`);
        }

        try {
            const output = await this.leaderboardService.addLeaderboardScore(authId, score);
            this.logger.log(`${logString} returning ${JSON.stringify(output)}`);
            return output;
        } catch (e) {
            this.returnError(logString, 500, e);
        }
    }

    @ApiOperation({ summary: 'Add to a user score on the leaderboard' })
    @Get('/api/v2/sprint')
    async getLeaderboardSprint(@Body() query: GetLeaderboardSprintDto): Promise<GetLeaderboardSprintResponseDto> {
        const logString = `GET /api/v2/sprint ${JSON.stringify(query)}`;
        this.logger.log(logString);
        try {
            let { sprint, limit } = query;
            let output = null;
            if (sprint && sprint.length) {
                output = await this.leaderboardService.getLeaderboardSprint(sprint);
            } else {
                output = await this.leaderboardService.getLeaderboardSprints(limit);
            }
            this.logger.log(`${logString} returning ${JSON.stringify(output)}`);
            return output;
        } catch (e) {
            this.returnError(logString, 500, e);
        }
    }
}
