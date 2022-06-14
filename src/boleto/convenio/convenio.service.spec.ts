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

  it('should parse bar code', () => {
    const barCode = '83660000001815200531072097004211110006394306';
    expect(service.convenioBarCode(barCode)).toMatchInlineSnapshot(`
      Object {
        "barCode": "83660000001815200531072097004211110006394306",
        "entityId": "0053",
        "kind": "ConvenioBarCode",
        "productId": "8",
        "rest": "1072097004211110006394306",
        "segmentId": "3",
        "value": "00000018152",
        "valueId": "6",
        "verificationNumber": "6",
      }
    `);
  });

  it('should parse digits', () => {
    const barCode = '836600000019815200531078209700421115100063943060';
    expect(service.convenioDigits(barCode)).toMatchInlineSnapshot(`
      Object {
        "barCode": "836600000019815200531078209700421115100063943060",
        "entityId": "0053",
        "kind": "ConvenioDigits",
        "productId": "8",
        "rest": "1072097004211110006394306",
        "segmentId": "3",
        "value": "00000018152",
        "valueId": "6",
        "verificationNumber": "6",
        "verificationNumberField1": "9",
        "verificationNumberField2": "8",
        "verificationNumberField3": "5",
        "verificationNumberField4": "0",
      }
    `);
  });

  it('should throw when the general Bar Code DV is invalid', () => {
    try {
      const code = '83600000001815200531072097004211110006394306';
      const convenio = service.convenioBarCode(code);
      expect(convenio).toBeFalsy();
    } catch (e) {
      expect(e).toMatchInlineSnapshot(
        `[BadRequestException: Digito verificador está incorreto.]`,
      );
    }
  });

  it.each([
    ['general DV', '836000000019815200531078209700421115100063943060'],
    ['first field DV', '836600000010815200531078209700421115100063943060'],
    ['second field DV', '836600000019815200531070209700421115100063943060'],
    ['third field DV', '836600000019815200531078209700421110100063943060'],
    ['fourth field DV', '836600000019815200531070209700421115100063943069'],
  ])('should throw when %s of the Digits DV is invalid', (_, code) => {
    try {
      const convenio = service.convenioDigits(code);
      expect(convenio).toBeFalsy();
    } catch (e) {
      expect(e).toMatchInlineSnapshot(
        `[BadRequestException: Digito verificador está incorreto.]`,
      );
    }
  });

  it('should correctly parse a date string in bar code', () => {
    const date = '20221212';
    expect(service.parseConvenioDate(date)).toEqual(
      new Date('2022-12-12').getTime(),
    );
  });

  it('should parse bar code correctly with CNPJ', () => {
    const barCode = '866100000011815200530054300001212046110639430609';
    expect(service.convenioDigits(barCode)).toMatchInlineSnapshot(`
      Object {
        "barCode": "866100000011815200530054300001212046110639430609",
        "dueDate": "00001212",
        "entityId": "00530053",
        "kind": "ConvenioDigits",
        "productId": "8",
        "rest": "0411063943060",
        "segmentId": "6",
        "value": "00000018152",
        "valueId": "6",
        "verificationNumber": "1",
        "verificationNumberField1": "1",
        "verificationNumberField2": "4",
        "verificationNumberField3": "6",
        "verificationNumberField4": "9",
      }
    `);
  });

  it('should parse bar code correctly with date', () => {
    const barCode = '836100000014815200532027212120421111100063943060';
    expect(service.convenioDigits(barCode)).toMatchInlineSnapshot(`
      Object {
        "barCode": "836100000014815200532027212120421111100063943060",
        "dueDate": "20221212",
        "entityId": "0053",
        "kind": "ConvenioDigits",
        "productId": "8",
        "rest": "04211110006394306",
        "segmentId": "3",
        "value": "00000018152",
        "valueId": "6",
        "verificationNumber": "1",
        "verificationNumberField1": "4",
        "verificationNumberField2": "7",
        "verificationNumberField3": "1",
        "verificationNumberField4": "0",
      }
    `);
  });

  it('should parse bar code correctly with date and CNPJ', () => {
    const barCode = '866100000011815200530054320221212048110639430609';
    expect(service.convenioDigits(barCode)).toMatchInlineSnapshot(`
      Object {
        "barCode": "866100000011815200530054320221212048110639430609",
        "dueDate": "20221212",
        "entityId": "00530053",
        "kind": "ConvenioDigits",
        "productId": "8",
        "rest": "0411063943060",
        "segmentId": "6",
        "value": "00000018152",
        "valueId": "6",
        "verificationNumber": "1",
        "verificationNumberField1": "1",
        "verificationNumberField2": "4",
        "verificationNumberField3": "8",
        "verificationNumberField4": "9",
      }
    `);
  });
});
