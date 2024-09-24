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
    AddLeaderboardV2Dto,
    AddLeaderboardResponseDto,
    GetLeaderboardSprintDto,
    GetLeaderboardSprintResponseDto,
    LimitDto,
    GetLeaderboardBeatmapsResponseDto,
} from '../entity/req.entity';
import { AppLogger } from '../app.logger';
import { LeaderboardService } from 'src/services/leaderboard.service';
import { returnError } from 'src/util/return-error';


//TODO: possible repeated code
const LEADERBOARD_DEFAULT_LIMIT: number = 100;
const MAX_WALLET_LENGTH = 100;

@Controller()
export class LeaderboardController {
    logger: AppLogger;

    //TODO: remove appService as a constructor param where it's not needed
    constructor(
        private readonly appService: AppService,
        private readonly leaderboardService: LeaderboardService
    ) {
        this.logger = new AppLogger('leaderboard.controller');
    }

    @Get('/')
    healthcheck() {
        return 'ok';
    }

    @ApiOperation({ summary: 'Get a user score from the leaderboard' })
    @Get('/api/v2/leaderboard')
    async getLeaderboardScore(@Query() query: GetLeaderboardDto): Promise<GetLeaderboardResponseDto> {
        const logString = `GET /api/v2/leaderboard ${JSON.stringify(query)}`;
        this.logger.log(logString);
        try {
            let { wallet, limit, sprint, beatmap } = query;
            if (!wallet || wallet == '') {
                wallet = null;
            }
            if (!limit) {
                limit = LEADERBOARD_DEFAULT_LIMIT;
            }
            let output = null;
            if (wallet && wallet.length) {
                output = await this.leaderboardService.getLeaderboardScore(wallet, beatmap);
            } else {
                output = await this.leaderboardService.getLeaderboardScores(beatmap, limit);
            }
            this.logger.log(`${logString} returning ${JSON.stringify(output)}`);
            return output;
        } catch (e) {
            returnError(logString, 500, e);
        }
    }

    @ApiOperation({ summary: 'Get the number of unique users for each beatmap leaderboard' })
    @Get('/api/v2/leaderboard/beatmaps')
    async getLeaderboardBeatmaps(@Query() query: LimitDto): Promise<GetLeaderboardBeatmapsResponseDto> {
        const logString = `GET /api/v2/leaderboard/beatmaps ${JSON.stringify(query)}`;
        this.logger.log(logString);
        try {
            let { limit } = query;
            if (!limit) {
                limit = LEADERBOARD_DEFAULT_LIMIT;
            }
            let output = await this.leaderboardService.getLeaderboardUniqueUsers();
            this.logger.log(`${logString} returning ${JSON.stringify(output)}`);
            return output;
        } catch (e) {
            returnError(logString, 500, e);
        }
    }

    @ApiOperation({ summary: 'Add to a user score on the leaderboard' })
    @Post('/api/v2/leaderboard')
    @HttpCode(200)
    async addLeaderboardScore(@Body() body: AddLeaderboardV2Dto): Promise<AddLeaderboardResponseDto> {
        const logString = `POST /api/v2/leaderboard ${JSON.stringify(body)}`;
        this.logger.log(logString);
        const { score, wallet, beatmap } = body;

        if (!score || score <= 0) {
            returnError(logString, 400, 'score cannot be null, zero or negative');
        }
        if (!wallet || wallet == '') {
            returnError(logString, 400, 'wallet cannot be null or empty');
        }
        if (wallet.length > MAX_WALLET_LENGTH) {
            returnError(logString, 400, `wallet exceeded max length of ${MAX_WALLET_LENGTH}`);
        }

        try {
            const output = await this.leaderboardService.addLeaderboardScore(wallet, score, beatmap);
            this.logger.log(`${logString} returning ${JSON.stringify(output)}`);
            return output;
        } catch (e) {
            returnError(logString, 500, e);
        }
    }

    @ApiOperation({ summary: 'Get leaderboard data for a specific sprint' })
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
            returnError(logString, 500, e);
        }
    }
}
