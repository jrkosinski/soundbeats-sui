import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "./app.controller";
import { SuiService } from "./sui.service";
import { RootTestModule } from "../test/root-test.module";
import { AuthManagerModule, ConfigSettingsModule, LeaderboardModule } from "./app.module";


describe("AppController", () => {
    let appController: AppController;
    let suiService: SuiService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [RootTestModule],
        }).compile();

        appController = module.get<AppController>(AppController);
        suiService = module.get<SuiService>(SuiService);
    });

    describe("root", () => {
        it('should return "Hello World!"', () => {
            expect(appController.getHello()).toBe("Hello World!");
        });
    });
});

describe("SuiService", () => {
    let service: SuiService;

    beforeEach(async () => {
        service = new SuiService(new ConfigSettingsModule(), new AuthManagerModule(), new LeaderboardModule());
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    /*
    it("should call createWallet", async () => {
        const createWalletSpy = jest.spyOn(service, "createWallet");
        await service.createWallet();
        expect(createWalletSpy).toHaveBeenCalled();
    });
    */
});
