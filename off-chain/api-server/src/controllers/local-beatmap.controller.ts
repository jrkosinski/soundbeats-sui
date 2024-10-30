import { Body, Controller, Get, HttpCode, Post, Put, Query } from '@nestjs/common';
import { AppLogger } from '../app.logger';
import { AppService } from '../app.service';
import { ApiOperation } from '@nestjs/swagger';
import {
    GetLeaderboardDto,
    GetLeaderboardResponseDto, GetLocalBeatmapResponseDto,
    LocalBeatmapsDto,
    UpdateLocalBeatmapsDto,
} from '../entity/req.entity';
import { returnError } from '../util/return-error';
import { LocalBeatmapsService } from '../services/local-beatmaps.service';

const MAX_URL_LENGTH = 400;
const MAX_USERNAME_LENGTH = 100;


@Controller()
export class LocalBeatmapController {
    logger: AppLogger;

    constructor(
        private readonly appService: AppService,
        private readonly localBeatmapsService: LocalBeatmapsService
    ) {
        this.logger = new AppLogger('leaderboard.controller');
    }

    @Get('/')
    healthcheck() {
        return 'ok';
    }

    @ApiOperation({ summary: 'Get a user score from the leaderboard' })
    @Get('/api/v2/local-beatmaps')
    async getLeaderboardScore(@Query() query: GetLeaderboardDto): Promise<GetLeaderboardResponseDto> {
        const logString = `GET /api/v2/local-beatmaps ${JSON.stringify(query)}`;
        this.logger.log(logString);
        try {
            let output = await this.localBeatmapsService.getAllLocalBeatmaps();
            this.logger.log(`${logString} returning ${JSON.stringify(output)}`);

            return output;
        } catch (e) {
            returnError(this.logger, logString, 500, e);
        }
    }



    @ApiOperation({ summary: 'Mint instances of BEATMAPS NFT to the given recipient' })
    @Post('/api/v2/local-beatmaps')
    @HttpCode(200)
    async addLocalBeatmap(@Body() body: LocalBeatmapsDto): Promise<{
        network: string;
        message: string;
        success: boolean
    }> {
        const logString = `POST /api/v2/nfts/beatmaps ${JSON.stringify(body)}`;
        this.logger.log(logString);
        let {  username, title, file } = body;

        if (!username || username == '') {
            returnError(this.logger, logString, 400, 'username cannot be null or empty');
        }
        if (username.length > MAX_USERNAME_LENGTH) {
            returnError(this.logger, logString, 400, `username exceeded max length of ${MAX_USERNAME_LENGTH}`);
        }
        if (!title || title == '') {
            returnError(this.logger, logString, 400, 'title cannot be null or empty');
        }

        if (!file || file == '') {
            returnError(this.logger, logString, 400, 'file cannot be null or empty');
        }
        if (file.length > MAX_URL_LENGTH) {
            returnError(this.logger, logString, 400, `file exceeded max length of ${MAX_URL_LENGTH}`);
        }

        try {
            const output = await this.localBeatmapsService.addLocalBeatmap(
                username,
                title,
                file
            );
            this.logger.log(`${logString} returning ${JSON.stringify(output)}`);
            return output;
        } catch (e) {
            returnError(this.logger, logString, 500, e);
        }
    }



    @ApiOperation({ summary: "Update local-beatmap's values." })
    @Put('/api/v2/local-beatmaps')
    async updateLocalBeatmap(@Body() body: UpdateLocalBeatmapsDto): Promise<GetLocalBeatmapResponseDto> {
        const logString = `POST /api/v2/level ${JSON.stringify(body)}`;
        let output = { title: '', status: '', file: '' };
        this.logger.log(logString);


        let { authId, file, title, id, username } = body;
        console.log(authId);
        if (!authId || authId == '') {
            returnError(this.logger, logString, 400, 'Auth Id cannot be null or empty');
        }

        try {
            output = await this.localBeatmapsService.updateLocalBeatmap(id,username, authId, file, title);
            this.logger.log(`${logString} returning ${JSON.stringify(output)}`);
            if (output.status === 'success') {
                return output;
            }
        } catch (e) {
            returnError(this.logger, logString, 500, e);
        }

        returnError(this.logger, logString, 400, output.status);
    }
}
