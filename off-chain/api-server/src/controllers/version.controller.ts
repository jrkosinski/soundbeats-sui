import { Controller, Get, Query, HttpCode } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { AppLogger } from '../app.logger';

@Controller()
export class VersionController {
    logger: AppLogger;

    constructor() {
        this.logger = new AppLogger('version.controller');
    }

    @Get('/')
    healthcheck() {
        return 'ok';
    }

    @ApiOperation({ summary: 'Get score for perfect hit' })
    @Get('/api/v2/buildversion')
    @HttpCode(200)
    async getBuildVersion(@Query() query: {}): Promise<{
        major: number;
        minor: number;
        revision: number;
        value: string;
        note: string;
    }> {
        const version = {
            major: 2,
            minor: 7,
            revision: 0,
            note: 'Dec 6 2024, Recommended APK version 0.5.0',
        };

        return { value: `${version.major}.${version.minor}.${version.revision}`, ...version };
    }
}
