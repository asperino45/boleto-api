import { ConfigService } from '@nestjs/config';
import { TestingModule, Test } from '@nestjs/testing';
import { BoletoUtilsService } from './boleto-utils.service';

describe('BoletoUtilsService', () => {
  let service: BoletoUtilsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BoletoUtilsService, ConfigService],
    }).compile();

    service = module.get<BoletoUtilsService>(BoletoUtilsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it.each([
    ['00190500', 9],
    ['4014481606', 9],
    ['0680935031', 4],
    ['01230067896', 3],
    ['8220000215048200974123220154098290108605940', 1],
  ])('should calculate the correct DV for mod 10 algorithm', (code, dv) => {
    expect(service.DV10(code)).toBe(dv);
  });

  it.each([['0019373700000001000500940144816060680935031', 3]])(
    'should calculate the correct DV for mod 11 algorithm for titulo',
    (code, dv) => {
      expect(service.DV11(code, true)).toBe(dv);
    },
  );

  it.each([
    ['01230067896', 0],
    ['8220000215048200974123220154098290108605940', 0],
  ])(
    'should calculate the correct DV for mod 11 algorithm for convenio',
    (code, dv) => {
      expect(service.DV11(code, dv)).toBe(dv);
    },
  );
});
