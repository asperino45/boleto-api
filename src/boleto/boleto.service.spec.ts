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

  it.each([
    ['TituloBarCode', '00193373700000001000500940144816060680935031'],
    ['TituloDigits', '23791699039020408221906002317003390120000035060'],
    ['ConvenioBarCode', '83660000001815200531072097004211110006394306'],
    ['ConvenioDigits', '836600000019815200531078209700421115100063943060'],
  ])('should return a validated %s', (_, code) => {
    expect(service.getBoletoResponseDto(code)).toBeDefined();
  });
});
