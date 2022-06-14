import { BadRequestException, Injectable } from '@nestjs/common';
import { BoletoResponseDto } from './dto/boleto.dto';
import { BoletoUtilsService } from './boleto-utils.service';
import { ConvenioService } from './convenio/convenio.service';
import { TituloService } from './titulo/titulo.service';
import {
  IBoleto,
  IConvenioBarCode,
  IConvenioDigits,
  ITituloBarCode,
  ITituloDigits,
} from './types';

@Injectable()
export class BoletoService {
  constructor(
    private readonly convenioService: ConvenioService,
    private readonly tituloService: TituloService,
  ) {}

  public async getBoletoResponseDto(barCode: string) {
    const boleto: IBoleto = await this.getAndValidateBoleto(barCode);

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
          this.tituloService.dueDateFactorToDate(boleto.dueDateFactor),
        );
      case 'TituloDigits':
        return new BoletoResponseDto(
          boleto.barCode,
          boleto.field5.value,
          this.tituloService.dueDateFactorToDate(boleto.field5.dueDateFactor),
        );
    }
  }

  public async getAndValidateBoleto(barCode: string): Promise<IBoleto> {
    let boleto: IBoleto;

    if (barCode.length === 47)
      boleto = this.getAndValidateTituloDigits(barCode);
    if (barCode.length === 48)
      boleto = this.getAndValidateConvenioDigits(barCode);
    if (barCode.length === 44) boleto = this.getAndValidateBarCode(barCode);

    return boleto;
  }

  // TODO: check if this condition is a guarantee, and no bankCode will ever start with 8
  public getAndValidateBarCode(
    barCode: string,
  ): ITituloBarCode | IConvenioBarCode {
    if (barCode[0] === '8') return this.getAndValidateConvenioBarCode(barCode);
    else return this.getAndValidateTituloBarCode(barCode);
  }

  public getAndValidateConvenioBarCode(barCode: string): IConvenioBarCode {
    const convenio = this.convenioService.convenioBarCode(barCode);
    return convenio;
  }

  public getAndValidateConvenioDigits(barCode: string): IConvenioDigits {
    const convenio = this.convenioService.convenioDigits(barCode);
    return convenio;
  }

  public getAndValidateTituloBarCode(barCode: string): ITituloBarCode {
    const titulo = this.tituloService.tituloBarCode(barCode);
    return titulo;
  }

  public getAndValidateTituloDigits(barCode: string): ITituloDigits {
    const titulo = this.tituloService.tituloDigits(barCode);
    return titulo;
  }
}
