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

@Controller()
export class SettingsController {
    logger: AppLogger;

    constructor(
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
    async getPerfectHitScore(@Query() query: {}): Promise<{ perfectHit: number, network: string }> {
        return {
            perfectHit: 5,
            network: 'testnet'
        };
    }
}
