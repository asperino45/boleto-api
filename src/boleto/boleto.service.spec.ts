import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { BoletoUtilsService } from './boleto-utils.service';
import { BoletoService } from './boleto.service';
import { ConvenioService } from './convenio/convenio.service';
import { TituloService } from './titulo/titulo.service';

describe('BoletoService', () => {
  let service: BoletoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoletoService,
        ConvenioService,
        TituloService,
        BoletoUtilsService,
        ConfigService,
      ],
    }).compile();

    service = module.get<BoletoService>(BoletoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
