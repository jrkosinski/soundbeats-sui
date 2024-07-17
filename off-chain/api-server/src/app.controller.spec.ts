import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { SuiService } from "./sui.service";
import { RootTestModule } from "../test/root-test.module";

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
        process.env.MNEMONIC_PHRASE =
            "gossip pause play insect dog spray rose rally flavor foster excess vanish";

        const module: TestingModule = await Test.createTestingModule({
            providers: [SuiService],
        }).compile();
        service = module.get<SuiService>(SuiService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    it("should call createWallet", async () => {
        const createWalletSpy = jest.spyOn(service, "createWallet");
        await service.createWallet();
        expect(createWalletSpy).toHaveBeenCalled();
    });
});
