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
import { BeatmapsService } from 'src/services/beatmaps.service';
import { returnError } from 'src/util/return-error';
import { IBeatmap } from 'src/repositories/beatmaps/IBeatmaps';

@Controller()
export class BeatmapsController {
    logger: AppLogger;

    constructor(
        private readonly beatmapsService: BeatmapsService,
    ) {
        this.logger = new AppLogger('beatmaps.controller');
    }

    @Get('/')
    healthcheck() {
        return 'ok';
    }

    @ApiOperation({ summary: 'Create or update an unminted beatmap' })
    @Get('/api/v2/beatmaps')
    @HttpCode(200)
    async getBeatmaps(@Query() query: { beatmapId: string, minted: boolean }): Promise<IBeatmap[]> {
        const logString = `GET /api/v2/beatmaps ${JSON.stringify(query)}`;
        this.logger.log(logString);

        const { beatmapId, minted } = query;

        try {
            if (beatmapId) {
                const beatmap = await this.beatmapsService.getBeatmapById(beatmapId);
                return beatmap ? [beatmap] : [];
            } else {
                return this.beatmapsService.getBeatmaps(beatmapId, minted);
            }
        } catch (e) {
            returnError(this.logger, logString, 500, e);
        }

        return null;
    }

    @ApiOperation({ summary: 'Create or update an unminted beatmap' })
    @Post('/api/v2/beatmaps')
    @HttpCode(201)
    async saveUnmintedBeatmap(@Body() body: IBeatmap): Promise<{ code: string }> {
        const logString = `POST /api/v2/beatmaps ${JSON.stringify(body)}`;
        this.logger.log(logString);

        try {
            await this.beatmapsService.saveBeatmap(body);
        } catch (e) {
            returnError(this.logger, logString, 500, e);
        }

        return {
            code: ''
        };
    }
}
