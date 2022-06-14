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

  it('should parse bar code correctly', () => {
    const barCode = '00193373700000001000500940144816060680935031';
    expect(service.tituloBarCode(barCode)).toMatchInlineSnapshot(`
      Object {
        "bankCode": "001",
        "barCode": "00193373700000001000500940144816060680935031",
        "currencyCode": "9",
        "dueDateFactor": "3737",
        "kind": "TituloBarCode",
        "rest": "0500940144816060680935031",
        "value": "0000000100",
        "verificationNumber": "3",
      }
    `);
  });

  it('should parse digits correctly', () => {
    const barCode = '23791699039020408221906002317003390120000035060';
    expect(service.tituloDigits(barCode)).toMatchInlineSnapshot(`
      Object {
        "barCode": "23791699039020408221906002317003390120000035060",
        "field1": Object {
          "bankCode": "237",
          "currencyCode": "9",
          "rest20to24": "16990",
          "verificationNumber": "3",
        },
        "field2": Object {
          "rest25to34": "9020408221",
          "verificationNumber": "9",
        },
        "field3": Object {
          "rest35to44": "0600231700",
          "verificationNumber": "3",
        },
        "field4": "3",
        "field5": Object {
          "dueDateFactor": "9012",
          "value": "0000035060",
        },
        "kind": "TituloDigits",
      }
    `);
  });

  it.each([['00190373700000001000500940144816060680935031']])(
    'should throw when general Bar Code DV is invalid',
    (code) => {
      try {
        service.tituloBarCode(code);
      } catch (e) {
        expect(e).toMatchInlineSnapshot(
          `[BadRequestException: Digito verificador está incorreto.]`,
        );
      }
    },
  );

  it.each([
    ['general DV', '00190500954014481606906809350314037370000000100'],
    ['first field DV', '00190500954014481606906809350310337370000000100'],
    ['second field DV', '00190500954014481606906809350314337370000000100'],
    ['third field DV', '00190500904014481606006809350314337370000000100'],
  ])('should throw when %s of the Digits DV is invalid', (_, code) => {
    try {
      service.tituloDigits(code);
    } catch (e) {
      expect(e).toMatchInlineSnapshot(
        `[BadRequestException: Digito verificador está incorreto.]`,
      );
    }
  });

  it.each([
    ['3737', new Date('2007-12-31T00:00:00.000Z')],
    ['9999', new Date('2025-02-21T00:00:00.000Z')],
  ])('should correctly parse the due date factor', (dueDateFactor, dueDate) => {
    expect(service.dueDateFactorToDate(dueDateFactor)).toEqual(dueDate);
  });

  it.each(['0000', '10000', '999'])(
    'should throw when the due date factor is invalid',
    (dueDateFactor) => {
      try {
        service.dueDateFactorToDate(dueDateFactor);
      } catch (e) {
        expect(e).toMatchInlineSnapshot(
          `[BadRequestException: O fator de vencimento deve ser maior ou igual a 1000 e menor ou igual a 9999.]`,
        );
      }
    },
  );
});
