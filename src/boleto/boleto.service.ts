import { BadRequestException, Injectable } from '@nestjs/common';
import { BoletoResponseDto } from './dto/boleto.dto';
import { BoletoUtilsService } from './boleto-utils.service';
import { ConvenioService } from './convenio/convenio.service';
import { TituloService } from './titulo/titulo.service';
import {
  Boleto,
  ConvenioBarCode,
  ConvenioDigits,
  TituloBarCode,
  TituloDigits,
} from './types';

@Injectable()
export class BoletoService {
  constructor(
    private readonly convenioService: ConvenioService,
    private readonly tituloService: TituloService,
    private readonly boletoUtilsService: BoletoUtilsService,
  ) {}

  public async validateBoleto(barCode: string): Promise<BoletoResponseDto> {
    let boleto: Boleto;

    if (barCode.length === 47) boleto = this.validateTituloDigits(barCode);
    if (barCode.length === 48) boleto = this.validateConvenioDigits(barCode);
    if (barCode.length === 44) boleto = this.validateBarCode(barCode);

    switch (boleto.kind) {
      case 'ConvenioBarCode':
        return new BoletoResponseDto(
          boleto.barCode,
          boleto.value,
          boleto.dueDate
            ? new Date(this.convenioService.parseConvenioDate(boleto.dueDate))
            : null,
        );
      case 'ConvenioDigits':
        return new BoletoResponseDto(
          boleto.barCode,
          boleto.value,
          boleto.dueDate
            ? new Date(this.convenioService.parseConvenioDate(boleto.dueDate))
            : null,
        );
      case 'TituloBarCode':
        return new BoletoResponseDto(
          boleto.barCode,
          boleto.value,
          new Date(
            this.boletoUtilsService.dueDateFactorToDate(boleto.dueDateFactor),
          ),
        );
      case 'TituloDigits':
        return new BoletoResponseDto(
          boleto.barCode,
          boleto.field5.value,
          new Date(
            this.boletoUtilsService.dueDateFactorToDate(
              boleto.field5.dueDateFactor,
            ),
          ),
        );
    }
  }

  // TODO: check if this condition is a guarantee, and no bankCode will ever start with 8
  public validateBarCode(barCode: string): TituloBarCode | ConvenioBarCode {
    if (barCode[0] === '8') return this.validateConvenioBarCode(barCode);
    else return this.validateTituloBarCode(barCode);
  }

  public validateConvenioBarCode(barCode: string): ConvenioBarCode {
    const convenio = this.convenioService.convenioBarCode(barCode);

    // check length
    if (convenio.barCode.length !== 44) throw new Error();
    if (convenio.productId !== '8') throw new Error();
    // check DV
    if (!this.convenioService.validateConvenioBarCode(barCode))
      throw new Error();
    // check valueId
    if (!this.convenioService.isValidValueId(convenio.valueId))
      throw new Error();

    return convenio;
  }

  public validateConvenioDigits(barCode: string): ConvenioDigits {
    const convenio = this.convenioService.convenioDigits(barCode);

    // check length
    if (convenio.barCode.length !== 48) throw new Error();
    if (convenio.productId !== '8') throw new Error();
    // check DV
    if (!this.convenioService.validateConvenioDigits(barCode))
      throw new Error();
    // check valueId
    if (!['6', '7', '8', '9'].some((valueId) => valueId !== convenio.valueId))
      throw new Error();

    return convenio;
  }

  public validateTituloBarCode(barCode: string): TituloBarCode {
    const titulo = this.tituloService.tituloBarCode(barCode);

    // check DV
    if (!this.tituloService.validateTituloBarCode(barCode)) throw new Error();
    // check dueDateFactor
    if (!this.boletoUtilsService.validateDueDateFactor(titulo.dueDateFactor))
      throw new Error();
    // check currencyCode === 9 (brl)
    if (titulo.currencyCode !== '9') throw new Error();
    // check meu número?

    return titulo;
  }

  public validateTituloDigits(barCode: string): TituloDigits {
    const titulo = this.tituloService.tituloDigits(barCode);

    // check DV
    if (!this.tituloService.validateTituloDigits(barCode))
      throw new BadRequestException();
    // check dueDateFactor
    if (
      !this.boletoUtilsService.validateDueDateFactor(
        titulo.field5.dueDateFactor,
      )
    )
      throw new Error();
    // check currencyCode === 9 (brl)
    if (titulo.field1.currencyCode !== '9') throw new Error();
    // check meu número?

    return titulo;
  }
}
