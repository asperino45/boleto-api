import { BadRequestException, Injectable } from '@nestjs/common';
import { BoletoUtilsService } from '../boleto-utils.service';
import { IConvenioBarCode, IConvenioDigits } from '../types';

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

    const convenio: IConvenioBarCode = {
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

    // check DV
    if (!this.validateConvenioBarCode(barCodeString))
      // check valueId
      this.isValidValueId(convenio.valueId);

    return convenio;
  }

  public getConvenioBarCodeFromConvenioDigits(convenio: IConvenioDigits) {
    return (
      convenio.productId +
      convenio.segmentId +
      convenio.valueId +
      convenio.verificationNumber +
      convenio.value +
      convenio.entityId +
      (convenio.dueDate ?? '') +
      convenio.rest
    );
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

    const convenio: IConvenioDigits = {
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

    // check DV
    this.validateConvenioDigits(barCodeString);
    // check valueId
    this.isValidValueId(convenio.valueId);

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

  public validateConvenioDV(barCodeWithoutDV: string, DV, valueId) {
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

  public getBarCodeWithoutDV(barCode: string) {
    return barCode.slice(0, 3) + barCode.slice(4);
  }

  public validateConvenioBarCode(barCode: string[44]) {
    const barCodeWithoutDV = this.getBarCodeWithoutDV(barCode);
    const DV = barCode[3];

    const isValid = this.validateConvenioDV(barCodeWithoutDV, DV, barCode[2]);
    if (isValid) return isValid;

    throw new BadRequestException('Digito verificador está incorreto.');
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

    this.validateConvenioBarCode(fields.join(''));

    const isValidFields = fields.every((field, idx) => {
      const res = this.validateConvenioDV(field, fieldsDV[idx], barCode[2]);
      return res;
    });
    if (isValidFields) return true;

    throw new BadRequestException('Digito verificador está incorreto.');
  }

  public readonly VALID_VALUE_ID = ['6', '7', '8', '9'];

  public isValidValueId(digit: string[1]) {
    return this.VALID_VALUE_ID.some((valueId) => valueId === digit);
  }

  public getBarCodeStringFromDigits(barCode: string) {
    return (
      barCode.slice(0, 11) +
      barCode.slice(11, 12) +
      barCode.slice(12, 23) +
      barCode.slice(23, 24) +
      barCode.slice(24, 35) +
      barCode.slice(35, 36) +
      barCode.slice(36, 47) +
      barCode.slice(47, 48)
    );
  }
}
