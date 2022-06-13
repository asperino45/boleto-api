import { Injectable } from '@nestjs/common';
import { BoletoUtilsService } from '../boleto-utils.service';
import { TituloBarCode, TituloDigits } from '../types';

@Injectable()
export class TituloService {
  constructor(private readonly boletoUtilsService: BoletoUtilsService) {}
  public tituloBarCode(barCode: string) {
    const barCodeString = barCode.toString();
    const titulo: TituloBarCode = {
      barCode: barCodeString,
      bankCode: barCodeString.slice(0, 3),
      currencyCode: barCodeString.slice(3, 4),
      verificationNumber: barCodeString.slice(4, 5),
      dueDateFactor: barCodeString.slice(5, 9),
      value: barCodeString.slice(9, 19),
      rest: barCodeString.slice(19, 44),
      kind: 'TituloBarCode',
    };

    return titulo;
  }

  public tituloDigits(barCode: string) {
    const titulo: TituloDigits = {
      barCode: barCode,
      field1: {
        bankCode: barCode.slice(0, 3),
        currencyCode: barCode.slice(3, 4),
        rest20to24: barCode.slice(4, 9),
        verificationNumber: barCode.slice(9, 10),
      },
      field2: {
        rest25to34: barCode.slice(10, 20),
        verificationNumber: barCode.slice(20, 21),
      },
      field3: {
        rest35to44: barCode.slice(21, 31),
        verificationNumber: barCode.slice(31, 32),
      },
      field4: barCode.slice(32, 33),
      field5: {
        dueDateFactor: barCode.slice(33, 37),
        value: barCode.slice(37, 47),
      },
      kind: 'TituloDigits',
    };

    return titulo;
  }

  public toTituloDigits(barCode: TituloBarCode) {
    const titulo: TituloDigits = {
      barCode: barCode.barCode,
      field1: {
        bankCode: barCode.bankCode,
        currencyCode: barCode.currencyCode,
        rest20to24: barCode.rest.slice(0, 5),
        verificationNumber: null,
      },
      field2: {
        rest25to34: barCode.rest.slice(5, 15),
        verificationNumber: null,
      },
      field3: {
        rest35to44: barCode.rest.slice(15, 25),
        verificationNumber: null,
      },
      field4: barCode.verificationNumber,
      field5: {
        dueDateFactor: barCode.dueDateFactor,
        value: barCode.dueDateFactor,
      },
      kind: 'TituloDigits',
    };

    return titulo;
  }

  public validateTituloBarCode(barCode: string[44]) {
    const barCodeWithoutDV = parseInt(barCode.slice(0, 5) + barCode.slice(6));
    const DV = barCode[5];
    return (
      DV === this.boletoUtilsService.DV11(barCodeWithoutDV, true).toString()
    );
  }

  public validateTituloDigits(barCode: string[47]): boolean {
    const field1 = barCode.slice(0, 10);
    const field1DV = barCode.slice(10, 11);
    const field2 = barCode.slice(11, 22);
    const field2DV = barCode.slice(22, 23);
    const field3 = barCode.slice(23, 34);
    const field3DV = barCode.slice(34, 35);
    const fields = [field1, field2, field3];
    const fieldsDV = [field1DV, field2DV, field3DV];

    return fields.every((field, idx) => {
      return fieldsDV[idx] === this.boletoUtilsService.DV10(field).toString();
    });
  }
}
