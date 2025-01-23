import { DynamicModule, MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
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
import { LocalBeatmapsDynamoDb } from './repositories/localBeatmaps/LocalBeatmapsDynamoDb';
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
import { VersionController } from './controllers/version.controller';
import { SettingsService } from './services/settings.service';
import { ILocalBeatmapsRepo } from './repositories/localBeatmaps/ILocalBeatmaps';
import { LocalBeatmapsService } from './services/local-beatmaps.service';
import { LocalBeatmapController } from './controllers/local-beatmap.controller';
import { UserReferralsDynamoDb } from './repositories/userReferrals/UserReferralsDynamoDb';
import { IUserReferralsRepo } from './repositories/userReferrals/IUserReferralsManager';
import { UserReferralService } from './services/user-refferal.service';
import { UserReferralsController } from './controllers/user-referrals.controller';
import { AdminController } from './controllers/admin/admin.controller';
import { IAdminRepo } from './repositories/admin/IAdmin';
import { AdminDynamoDb } from './repositories/admin/AdminDynamoDb';
import { AdminAuthService } from './services/admin/admin.auth.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { JwtService } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
dotenv.config();


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
export class LocalBeatmapsModule {
    static register(): DynamicModule {
        let provider = {
            provide: 'LocalBeatmapsModule',
            useClass: LocalBeatmapsModule,
        };

        return {
            module: LocalBeatmapsModule,
            providers: [provider],
            exports: [provider],
        };
    }

    get(config: IConfigSettings): ILocalBeatmapsRepo {
        return config.testMode ? new LocalBeatmapsDynamoDb(config) : new LocalBeatmapsDynamoDb(config);
    }
}


@Module({})
export class RewardsModule {
    static register(): DynamicModule {
        let provider = {
            provide: 'RewardsModule',
            useClass: RewardsModule,
        };

        return {
            module: RewardsModule,
            providers: [provider],
            exports: [provider],
        };
    }

    get(config: IConfigSettings): IRewardRepo {
        return new RewardDynamoDb(config);
    }
}

@Module({})
export class UserGameStatsModule {
    static register(): DynamicModule {
        let provider = {
            provide: 'UserGameStatsModule',
            useClass: UserGameStatsModule,
        };

        return {
            module: UserGameStatsModule,
            providers: [provider],
            exports: [provider],
        };
    }

    get(config: IConfigSettings): IUserGameStatsRepo {
        return new UserGameStatsDynamoDb(config);
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
export class AdminModule {
    static register(): DynamicModule {
        let provider = {
            provide: 'AdminModule',
            useClass: AdminModule,
        };

        return {
            module: AdminModule,
            providers: [provider],
            exports: [provider],
        };
    }


    get(config: IConfigSettings): IAdminRepo {
        return new AdminDynamoDb(config);
    }
}


@Module({})
export class UserReferralsModule {
    static register(): DynamicModule {
        let provider = {
            provide: 'UserReferralsModule',
            useClass: UserReferralsModule,
        };

        return {
            module: UserReferralsModule,
            providers: [provider],
            exports: [provider],
        };
    }
    get(config: IConfigSettings): IUserReferralsRepo {
        return config.testMode ? new UserReferralsDynamoDb(config) : new UserReferralsDynamoDb(config);
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


import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RewardDynamoDb } from './repositories/reward/RewardDynamoDb';
import { IRewardRepo } from './repositories/reward/IReward';
import { RewardService } from './services/reward.service';
import { RewardsController } from './controllers/admin/rewards.controller';
import { AdminAuthController } from './controllers/admin/admin.auth.controller';
import { UserGameStatsDynamoDb } from './repositories/userGameStats/UserGameStatsDynamoDb';
import { IUserGameStatsRepo } from './repositories/userGameStats/IUserGameStats';
import { UserGameStatsService } from './services/user-game-stats.service';
import { S3Service } from './services/s3.service';

@Injectable()
export class JwtAuthMiddleware implements NestMiddleware {
    constructor(private readonly authService: AuthService) {}

    async use(req: Request, res: Response, next: NextFunction) {
        const token = req.cookies?.jwt;

        if(token && req.url === '/admin/login') {
            req.url = req.url.replace(/^\/admin\/login/, '/admin');
        }else if (!token && req.url.startsWith('/admin') && req.url !== '/admin/login') {
            req.url ='/admin/login';
        }

        next()
    }
}
@Module({
    imports: [
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', '/public'),
            serveStaticOptions: { index: false },
        }),
        ConfigModule.forRoot(),
        AuthManagerModule.register(),
        ConfigSettingsModule.register(),
        LeaderboardModule.register(),
        BeatmapsModule.register(),
        LocalBeatmapsModule.register(),
        ReferralModule.register(),
        AdminModule.register(),
        UserReferralsModule.register(),
        RewardsModule.register(),
        UserGameStatsModule.register()
    ],
    controllers: [
        AppController,
        AdminAuthController,
        RewardsController,
        LeaderboardController,
        TokenController,
        AuthController,
        VersionController,
        SettingsController,
        ReferralController,
        AdminController,
        LocalBeatmapController,
        UserReferralsController
    ],
    providers: [
        JwtService,
        // AdminService,
        AppService,
        SuiService,
        LeaderboardService,
        TokenService,
        AuthService,
        ReferralService,
        SettingsService,
        LocalBeatmapsService,
        UserReferralService,
        AdminAuthService,
        RewardService,
        UserGameStatsService,
        S3Service
    ],
})
export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(JwtAuthMiddleware)
            .forRoutes({ path: '/admin*', method: RequestMethod.GET }, { path: '/admin/login', method: RequestMethod.GET });
    }
}
