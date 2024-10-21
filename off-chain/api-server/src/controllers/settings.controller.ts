import {
    Controller,
    Get,
    Query,
    HttpCode,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { AppLogger } from '../app.logger';
import { SettingsService } from 'src/services/settings.service';

@Controller()
export class SettingsController {
    logger: AppLogger;

    constructor(
        private readonly settingsService: SettingsService,
    ) {
        this.logger = new AppLogger('settings.controller');
    }

    @Get('/')
    healthcheck() {
        return 'ok';
    }

    @ApiOperation({ summary: 'Get score for perfect hit' })
    @Get('/api/v2/settings')
    @HttpCode(200)
    async getPerfectHitScore(@Query() query: {}): Promise<{
        perfectHit: number,
        beatmapReferrerReward: number,
        beatmapReferredReward: number,
        network: string
    }> {
        return this.settingsService.getSettings();
    }
}
