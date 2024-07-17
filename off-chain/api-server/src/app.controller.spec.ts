import { Test, TestingModule } from '@nestjs/testing'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { SuiService } from '../src/sui.service';
import { RootTestModule } from '../test/root-test.module';



describe('AppController', () => {
    let appController: AppController;
    let suiService: SuiService;


    beforeEach(async () => {

        const module: TestingModule = await Test.createTestingModule({
            imports: [RootTestModule],
          }).compile();


        appController = module.get<AppController>(AppController);
        suiService = module.get<SuiService>(SuiService);

    });

    describe('root', () => {
        it('should return "Hello World!"', () => {
          expect(appController.getHello()).toBe('Hello World!');
        });
      });

    
    // describe('Tokens', () => {
    //     it('get empty wallet balance', async () => {
    //         const request = {
    //             wallet: "0x5b6b984e9325541535b189efc78b3df9e08c1b964255d7a96fa2f1801e60554e"
    //         }
    //         const response = await appController.getTokenBalance(request);
    //         expect(response.balance).toEqual(0);
    //     })
    // });
})
