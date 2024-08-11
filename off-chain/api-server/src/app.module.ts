import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { LeaderboardController } from './controllers/leaderboard.controller';
import { TokenController } from './controllers/tokens.controller';
import { AppService } from './app.service';
import { AuthManagerDynamoDb } from './repositories/auth/AuthManagerDynamoDb';
import { IAuthManager } from './repositories/auth/IAuthManager';
import { AuthManagerMock } from './repositories/auth/AuthManagerMock';
import { SuiService } from './sui.service';
import { ConfigSettings, IConfigSettings } from './config';
import { ILeaderboard } from './repositories/leaderboard/ILeaderboard';
import { LeaderboardDynamoDb } from './repositories/leaderboard/LeaderboardDynamoDb';
import { LeaderboardMock } from './repositories/leaderboard/LeaderboardMock';
import { LeaderboardService } from './services/leaderboard.service';
import { TokenService } from './services/tokens.service';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';

@Module({})
export class AuthManagerModule {
    static register(): DynamicModule {
        let provider = {
            provide: 'AuthManagerModule',
            useClass: AuthManagerModule,
        };

        return {
            module: AuthManagerModule,
            providers: [provider],
            exports: [provider],
        };
    }

    get(config: IConfigSettings): IAuthManager {
        return config.testMode ? new AuthManagerMock(config) : new AuthManagerDynamoDb(config);
    }
}

@Module({})
export class LeaderboardModule {
    static register(): DynamicModule {
        let provider = {
            provide: 'LeaderboardModule',
            useClass: LeaderboardModule,
        };

        return {
            module: LeaderboardModule,
            providers: [provider],
            exports: [provider],
        };
    }

    get(config: IConfigSettings): ILeaderboard {
        return config.testMode ? new LeaderboardMock(config) : new LeaderboardDynamoDb(config);
    }
}

@Module({})
export class ConfigSettingsModule {
    static register(): DynamicModule {
        let provider = {
            provide: 'ConfigSettingsModule',
            useClass: ConfigSettingsModule,
        };

        return {
            module: ConfigSettingsModule,
            providers: [provider],
            exports: [provider],
        };
    }

    get(): ConfigSettings {
        return new ConfigSettings();
    }
}

@Module({
    imports: [
        ConfigModule.forRoot(),
        AuthManagerModule.register(),
        ConfigSettingsModule.register(),
        LeaderboardModule.register()
    ],
    controllers: [AppController, LeaderboardController, TokenController, AuthController],
    providers: [AppService, SuiService, LeaderboardService, TokenService, AuthService],
})

export class AppModule { }
