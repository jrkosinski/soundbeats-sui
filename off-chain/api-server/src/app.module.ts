import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthManagerDynamoDb } from './auth/AuthManagerDynamoDb';
import { AuthManagerMock } from './auth/AuthManagerMock';
import { SuiService } from './sui.service';

@Module({})
export class AuthManagerModule {
    static register(environment: 'production' | 'test'): DynamicModule {
        let provider = {
            provide: 'IAuthManager',
            useClass: AuthManagerDynamoDb,
        };

        if (environment === 'test') {
            provider = {
                provide: 'IAuthManager',
                useClass: AuthManagerDynamoDb,
            };
        }

        return {
            module: AuthManagerModule,
            providers: [provider],
            exports: [provider],
        };
    }
}

@Module({
    imports: [
        ConfigModule.forRoot(),
        AuthManagerModule.register(process.env.NODE_ENV === 'test' ? 'test' : 'production'),
    ],
    controllers: [AppController],
    providers: [AppService, SuiService],
})
export class AppModule {}
