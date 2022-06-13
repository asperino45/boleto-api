import { Injectable } from '@nestjs/common';
import { BoletoUtilsService } from '../boleto-utils.service';
import { ConvenioBarCode, ConvenioDigits } from '../types';

@Injectable()
export class ConvenioService {
  constructor(private readonly boletoUtilsService: BoletoUtilsService) {}

  public convenioBarCode(barCodeString: string) {
    const dueDate = barCodeString.slice(19, 27);
    const isValidDueDate = this.isValidConvenioDate(dueDate);
    const _isConvenioCNPJ = this.isConvenioCNPJ(barCodeString);

    let restOffset = 19;
    restOffset += isValidDueDate && 8;
    restOffset += _isConvenioCNPJ && 4;

    const convenio: ConvenioBarCode = {
      barCode: barCodeString,
      productId: barCodeString.slice(0, 1),
      segmentId: barCodeString.slice(1, 2),
      valueId: barCodeString.slice(2, 3),
      verificationNumber: barCodeString.slice(3, 4),
      value: barCodeString.slice(4, 15),
      entityId: _isConvenioCNPJ
        ? barCodeString.slice(15, 23)
        : barCodeString.slice(15, 19),
      rest: barCodeString.slice(restOffset, 44),
      kind: 'ConvenioBarCode',
    };

    if (isValidDueDate)
      convenio.dueDate = _isConvenioCNPJ
        ? barCodeString.slice(23, 31)
        : barCodeString.slice(19, 27);

    return convenio;
  }

  public convenioDigits(barCodeString: string) {
    const _isConvenioCNPJ = this.isConvenioCNPJ(barCodeString);
    const dueDate = _isConvenioCNPJ
      ? barCodeString.slice(25, 33)
      : barCodeString.slice(20, 23) + barCodeString.slice(24, 29);
    const isValidDueDate = this.isValidConvenioDate(dueDate);

    let rest;
    if (isValidDueDate && _isConvenioCNPJ)
      rest = barCodeString.slice(33, 35) + barCodeString.slice(36, 47);
    else if (isValidDueDate)
      rest = barCodeString.slice(29, 35) + barCodeString.slice(36, 47);
    else if (_isConvenioCNPJ)
      rest = barCodeString.slice(25, 35) + barCodeString.slice(36, 47);
    else
      rest =
        barCodeString.slice(20, 23) +
        barCodeString.slice(24, 35) +
        barCodeString.slice(36, 47);

    const convenio: ConvenioDigits = {
      barCode: barCodeString,
      productId: barCodeString.slice(0, 1),
      segmentId: barCodeString.slice(1, 2),
      valueId: barCodeString.slice(2, 3),
      verificationNumber: barCodeString.slice(3, 4),
      value: barCodeString.slice(4, 11) + barCodeString.slice(12, 16),
      entityId: _isConvenioCNPJ
        ? barCodeString.slice(16, 23) + barCodeString.slice(24, 25)
        : barCodeString.slice(16, 20),
      rest,
      kind: 'ConvenioDigits',
      verificationNumberField1: barCodeString.slice(11, 12),
      verificationNumberField2: barCodeString.slice(23, 24),
      verificationNumberField3: barCodeString.slice(35, 36),
      verificationNumberField4: barCodeString.slice(47, 48),
    };

    if (isValidDueDate) convenio.dueDate = dueDate;

    return convenio;
  }

  public parseConvenioDate(date: string[8]) {
    const dueDate: number | Date = Date.parse(
      `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`,
    );

    return dueDate;
  }

  public isValidConvenioDate(date: string[8]) {
    return !isNaN(this.parseConvenioDate(date));
  }

  public isConvenioCNPJ(barCode: string) {
    return barCode[1] === '6';
  }

  public validateConvenioDV(barCodeWithoutDV, DV, valueId) {
    if (valueId === '6')
      return DV === this.boletoUtilsService.DV10(barCodeWithoutDV).toString();
    if (valueId === '7')
      return DV === this.boletoUtilsService.DV10(barCodeWithoutDV).toString();
    if (valueId === '8')
      return (
        DV === this.boletoUtilsService.DV11(barCodeWithoutDV, false).toString()
      );
    if (valueId === '9')
      return (
        DV === this.boletoUtilsService.DV11(barCodeWithoutDV, false).toString()
      );
  }

  public validateConvenioBarCode(barCode: string[44]) {
    const barCodeWithoutDV = parseInt(barCode.slice(0, 3) + barCode.slice(4));
    const DV = barCode[3];

    return this.validateConvenioDV(barCodeWithoutDV, DV, barCode[2]);
  }

  public validateConvenioDigits(barCode: string) {
    const field1 = barCode.slice(0, 11);
    const field1DV = barCode.slice(11, 12);
    const field2 = barCode.slice(12, 23);
    const field2DV = barCode.slice(23, 24);
    const field3 = barCode.slice(24, 35);
    const field3DV = barCode.slice(35, 36);
    const field4 = barCode.slice(36, 47);
    const field4DV = barCode.slice(47, 48);
    const fields = [field1, field2, field3, field4];
    const fieldsDV = [field1DV, field2DV, field3DV, field4DV];

    return fields.every((field, idx) => {
      return this.validateConvenioDV(field, fieldsDV[idx], barCode[2]);
    });
  }

  public readonly VALID_VALUE_ID = ['6', '7', '8', '9'];

  public isValidValueId(digit: string[1]) {
    return this.VALID_VALUE_ID.some((valueId) => valueId === digit);
  }
}
