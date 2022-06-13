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

    // check DV
    if (!this.convenioService.validateConvenioBarCode(barCode))
      throw new BadRequestException('Digito verificador está incorreto.');
    // check valueId
    this.isValidValueId(convenio.valueId);

    return convenio;
  }

  public validateConvenioDigits(barCode: string): ConvenioDigits {
    const convenio = this.convenioService.convenioDigits(barCode);

    // check DV
    if (!this.convenioService.validateConvenioDigits(barCode))
      throw new BadRequestException('Digito verificador está incorreto.');
    // check valueId
    this.isValidValueId(convenio.valueId);

    return convenio;
  }

  private isValidValueId(valueId: string[1]) {
    if (!this.convenioService.isValidValueId(valueId))
      throw new BadRequestException(
        'O digito identificador do valor deve ser 6, 7, 8, 9.',
      );
  }

  public validateTituloBarCode(barCode: string): TituloBarCode {
    const titulo = this.tituloService.tituloBarCode(barCode);

    // check DV
    if (!this.tituloService.validateTituloBarCode(barCode))
      throw new BadRequestException('Digito verificador está incorreto.');
    // check dueDateFactor
    this.isValidDueDateFactor(titulo.dueDateFactor);
    // check currencyCode === 9 (brl)
    this.isValidCurrencyCode(titulo.currencyCode);
    // check meu número?

    return titulo;
  }

  private isValidDueDateFactor(dueDateFactor: string[4]) {
    if (!this.boletoUtilsService.validateDueDateFactor(dueDateFactor))
      throw new BadRequestException(
        'Fator de vencimento não está no intervalo aceitável (1000,9999).',
      );
  }

  public validateTituloDigits(barCode: string): TituloDigits {
    const titulo = this.tituloService.tituloDigits(barCode);

    // check DV
    if (!this.tituloService.validateTituloDigits(barCode))
      throw new BadRequestException('Digito verificador está incorreto.');
    // check dueDateFactor
    this.isValidDueDateFactor(titulo.field5.dueDateFactor);
    // check currencyCode === 9 (brl)
    this.isValidCurrencyCode(titulo.field1.currencyCode);
    // check meu número?

    return titulo;
  }

  private isValidCurrencyCode(currencyCode: string[1]) {
    if (currencyCode !== '9')
      throw new BadRequestException('Valor da moeda deve ser 9 (real).');
  }
}
