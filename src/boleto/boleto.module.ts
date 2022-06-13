import { Module } from '@nestjs/common';
import { BoletoController } from './boleto.controller';
import { BoletoService } from './boleto.service';
import { TituloService } from './titulo/titulo.service';
import { ConvenioService } from './convenio/convenio.service';
import { BoletoUtilsService } from './boleto-utils.service';

@Module({
  controllers: [BoletoController],
  providers: [
    BoletoService,
    TituloService,
    ConvenioService,
    BoletoUtilsService,
  ],
})
export class BoletoModule {}
