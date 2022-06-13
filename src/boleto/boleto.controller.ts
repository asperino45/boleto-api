import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger/dist/decorators';
import { BoletoRequestDto, BoletoResponseDto } from './dto/boleto.dto';
import { BoletoService } from './boleto.service';

@ApiTags('Boleto')
@Controller('boleto')
export class BoletoController {
  constructor(private readonly boletoService: BoletoService) {}

  @Get(':barCode')
  @ApiOkResponse({
    description: 'O boleto foi validado com sucesso.',
    type: BoletoResponseDto,
  })
  public async getBoleto(
    @Param() barCode: BoletoRequestDto,
  ): Promise<BoletoResponseDto> {
    return this.boletoService.validateBoleto(barCode.barCode);
  }
}
