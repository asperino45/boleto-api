import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { BoletoUtilsService } from '../boleto-utils.service';
import { ConvenioService } from './convenio.service';

describe('ConvenioService', () => {
  let service: ConvenioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConvenioService, BoletoUtilsService, ConfigService],
    }).compile();

    service = module.get<ConvenioService>(ConvenioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
