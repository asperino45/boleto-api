import {
  BadRequestException,
  Injectable,
  NotImplementedException,
} from '@nestjs/common';
import { BoletoUtilsService } from '../boleto-utils.service';
import { ITituloBarCode, ITituloDigits } from '../types';
import { dayToMillisecond } from '../utils';

@Injectable()
export class TituloService {
  constructor(private readonly boletoUtilsService: BoletoUtilsService) {}
  public tituloBarCode(barCode: string) {
    const barCodeString = barCode.toString();
    const titulo: ITituloBarCode = {
      barCode: barCodeString,
      bankCode: barCodeString.slice(0, 3),
      currencyCode: barCodeString.slice(3, 4),
      verificationNumber: barCodeString.slice(4, 5),
      dueDateFactor: barCodeString.slice(5, 9),
      value: barCodeString.slice(9, 19),
      rest: barCodeString.slice(19, 44),
      kind: 'TituloBarCode',
    };

    // check DV
    this.validateTituloBarCode(barCode);
    // check dueDateFactor
    this.validateDueDateFactor(titulo.dueDateFactor);
    // check currencyCode === 9 (brl)
    this.boletoUtilsService.isValidCurrencyCode(titulo.currencyCode);
    // check meu número?

    return titulo;
  }

  public getBarCodeWithoutDV(barCode: string[47]) {
    return barCode.slice(0, 4) + barCode.slice(5);
  }

  public getTituloBarCodeStringFromTituloDigitsString(barCode: string[47]) {
    return (
      barCode.slice(0, 3) +
      barCode.slice(3, 4) +
      barCode.slice(32, 33) +
      barCode.slice(33, 37) +
      barCode.slice(37, 47) +
      barCode.slice(4, 9) +
      barCode.slice(10, 20) +
      barCode.slice(21, 31)
    );
  }

  public getTituloDigitsStringFromTituloBarCodeString(
    titulo: string[44],
  ): string {
    throw new NotImplementedException();
  }

  public getTituloBarCodeFromTituloDigits(titulo: ITituloDigits) {
    return (
      titulo.field1.bankCode +
      titulo.field1.currencyCode +
      titulo.field4 +
      titulo.field5.dueDateFactor +
      titulo.field5.value +
      titulo.field1.rest20to24 +
      titulo.field2.rest25to34 +
      titulo.field3.rest35to44
    );
  }

  public toTituloBarCode(barCode: ITituloDigits): ITituloBarCode {
    const code = this.getTituloBarCodeFromTituloDigits(barCode);
    return this.tituloBarCode(code);
  }

  public tituloDigits(barCode: string) {
    const titulo: ITituloDigits = {
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

    // check DV
    this.validateTituloDigits(barCode);
    // check dueDateFactor
    this.validateDueDateFactor(titulo.field5.dueDateFactor);
    // check currencyCode === 9 (brl)
    this.boletoUtilsService.isValidCurrencyCode(titulo.field1.currencyCode);
    // check meu número?

    return titulo;
  }

  public toTituloDigits(barCode: ITituloBarCode) {
    const titulo: ITituloDigits = {
      barCode: this.getTituloDigitsStringFromTituloBarCodeString(
        barCode.barCode,
      ),
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
    const barCodeWithoutDV = this.getBarCodeWithoutDV(barCode);
    const DV = barCode[4];
    if (DV === this.boletoUtilsService.DV11(barCodeWithoutDV, true).toString())
      return true;

    throw new BadRequestException('Digito verificador está incorreto.');
  }

  public validateTituloDigits(barCode: string[47]): boolean {
    const field1 = barCode.slice(0, 9);
    const field1DV = barCode.slice(9, 10);
    const field2 = barCode.slice(10, 20);
    const field2DV = barCode.slice(20, 21);
    const field3 = barCode.slice(21, 31);
    const field3DV = barCode.slice(31, 32);
    const fields = [field1, field2, field3];
    const fieldsDV = [field1DV, field2DV, field3DV];

    const isValidBarCodeDV = this.validateTituloBarCode(
      this.getTituloBarCodeStringFromTituloDigitsString(barCode),
    );

    const isValidFieldDV = fields.every((field, idx) => {
      return fieldsDV[idx] === this.boletoUtilsService.DV10(field).toString();
    });

    if (!isValidFieldDV)
      throw new BadRequestException('Digito verificador está incorreto.');

    return isValidFieldDV && isValidBarCodeDV;
  }

  public validateDueDateFactor(date: string[4]) {
    if (parseInt(date) >= 1000 && parseInt(date) <= 9999) return true;
    throw new BadRequestException(
      'O fator de vencimento deve ser maior ou igual a 1000 e menor ou igual a 9999.',
    );
  }

  public dueDateFactorToDate(date: string[4]) {
    this.validateDueDateFactor(date);
    const dueDate = new Date(dayToMillisecond(parseInt(date) - 1000));
    return new Date(
      this.boletoUtilsService.DUE_DATE_FACTOR_1000.getTime() +
        dueDate.getTime(),
    );
  }
}
