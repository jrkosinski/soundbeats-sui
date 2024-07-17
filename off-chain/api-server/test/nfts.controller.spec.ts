import { Test, TestingModule } from '@nestjs/testing';
import { NftsController } from '../src/nfts/nfts.controller';
import { NftsService } from '../src/nfts/nfts.service';
import { MockDatabaseModule } from './mock-database.module';

describe('NftsController', () => {
  let controller: NftsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NftsController],
      imports: [MockDatabaseModule],
      providers: [NftsService],
    }).compile();

    controller = module.get<NftsController>(NftsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Add more tests here
});