import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { LeaderboardController } from './controllers/leaderboard.controller';
import { TokenController } from './controllers/tokens.controller';
import { SettingsController } from './controllers/settings.controller';
import { AppService } from './app.service';
import { AuthManagerDynamoDb } from './repositories/auth/AuthManagerDynamoDb';
import { IAuthManager } from './repositories/auth/IAuthManager';
import { AuthManagerMock } from './repositories/auth/AuthManagerMock';
import { SuiService } from './sui.service';
import { ConfigSettings, IConfigSettings } from './config';
import { ILeaderboard } from './repositories/leaderboard/ILeaderboard';
import { LeaderboardDynamoDb } from './repositories/leaderboard/LeaderboardDynamoDb';
import { BeatmapsDynamoDb } from './repositories/beatmaps/BeatmapsDynamoDb';
import { LeaderboardMock } from './repositories/leaderboard/LeaderboardMock';
import { LeaderboardService } from './services/leaderboard.service';
import { TokenService } from './services/tokens.service';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { IBeatmapsRepo } from './repositories/beatmaps/IBeatmaps';
import { ReferralController } from './controllers/referral.controller';
import { ReferralService } from './services/referral.service';
import { IReferralRepo } from './repositories/referral/IReferralManager';
import { ReferralDynamoDb } from './repositories/referral/ReferralDynamoDb';

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
export class BeatmapsModule {
    static register(): DynamicModule {
        let provider = {
            provide: 'BeatmapsModule',
            useClass: BeatmapsModule,
        };

        return {
            module: BeatmapsModule,
            providers: [provider],
            exports: [provider],
        };
    }

    get(config: IConfigSettings): IBeatmapsRepo {
        return config.testMode ? new BeatmapsDynamoDb(config) : new BeatmapsDynamoDb(config);
    }
}

@Module({})
export class ReferralModule {
    static register(): DynamicModule {
        let provider = {
            provide: 'ReferralModule',
            useClass: ReferralModule,
        };

        return {
            module: ReferralModule,
            providers: [provider],
            exports: [provider],
        };
    }

    get(config: IConfigSettings): IReferralRepo {
        return config.testMode ? new ReferralDynamoDb(config) : new ReferralDynamoDb(config);
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
        LeaderboardModule.register(),
        BeatmapsModule.register(),
        ReferralModule.register()
    ],
    controllers: [AppController, LeaderboardController, TokenController, AuthController, SettingsController, ReferralController],
    providers: [AppService, SuiService, LeaderboardService, TokenService, AuthService, ReferralService],
})

export class AppModule { }
