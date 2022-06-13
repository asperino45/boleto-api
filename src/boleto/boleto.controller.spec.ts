import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { BoletoUtilsService } from './boleto-utils.service';
import { BoletoController } from './boleto.controller';
import { BoletoService } from './boleto.service';
import { ConvenioService } from './convenio/convenio.service';
import { TituloService } from './titulo/titulo.service';

describe('BoletoController', () => {
  let controller: BoletoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BoletoController],
      providers: [
        BoletoService,
        ConvenioService,
        TituloService,
        BoletoUtilsService,
        ConfigService,
      ],
    }).compile();

    controller = module.get<BoletoController>(BoletoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
