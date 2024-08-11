// test/root-test.module.ts
import { Module } from '@nestjs/common';
import { AppController } from '../src/app.controller';
import { AppService } from '../src/app.service';
import { SuiService } from '../src/sui.service';
import { AppLogger } from '../src/app.logger';
import { IAuthManager } from '../src/auth/IAuthManager';
import { AuthManagerMock } from '../src/auth/AuthManagerMock';
import { ConfigSettings } from '../src/config';
import { AuthManagerModule, ConfigSettingsModule, LeaderboardModule } from '../src/app.module';

@Module({
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: SuiService,
            useValue: new SuiService(new ConfigSettingsModule(), new AuthManagerModule(), new LeaderboardModule())
        },
        {
            provide: AppLogger,
            useValue: {
                // provide a mock implementation of the AppLogger
                log: () => { },
                error: () => { },
            },
        },
    ],
})
export class RootTestModule { }