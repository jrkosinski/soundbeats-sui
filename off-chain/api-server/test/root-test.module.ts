// test/root-test.module.ts
import { Module } from '@nestjs/common';
import { AppController } from '../src/app.controller';
import { AppService } from '../src/app.service';
import { SuiService } from '../src/sui.service';
import { AppLogger } from '../src/app.logger';

@Module({
    controllers: [AppController],
    providers: [
      AppService,
      {
        provide: SuiService,
        useValue: {
          // Provide a mock implementation of the SuiService
          getSomeData: () => ['mock data'],
        },
      },
      {
        provide: AppLogger,
        useValue: {
          // provide a mock implementation of the AppLogger
          log:() => {},
          error: () => {},
        },
      },
    ],
  })
  export class RootTestModule {}