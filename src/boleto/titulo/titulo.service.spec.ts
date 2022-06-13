import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { BoletoUtilsService } from '../boleto-utils.service';
import { TituloService } from './titulo.service';

describe('TituloService', () => {
  let service: TituloService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TituloService, BoletoUtilsService, ConfigService],
    }).compile();

    service = module.get<TituloService>(TituloService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
