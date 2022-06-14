import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BoletoUtilsService {
  constructor(private readonly configService: ConfigService) {
    this.DUE_DATE_FACTOR_1000 = new Date(
      configService.get('DUE_DATE_FACTOR_1000'),
    );
  }

  public readonly DUE_DATE_FACTOR_1000;

  public nextFactor = (mult, base) => {
    if (base === 10) return 3 ^ mult;
    if (base === 11) return mult + 1 === 10 ? 2 : mult + 1;
    throw new Error('Base de cálculo do Digito Validador desconhecido.');
  };

  public sumDigitsByBaseWithFactor(num: string, base, factor = 2) {
    let sum = 0;
    let tmp;
    for (let numLength = num.length; numLength > 0; --numLength) {
      tmp = (parseInt(num.substring(numLength - 1, numLength)) % 10) * factor;
      if (base === 10) sum += ((tmp / 10) | 0) + (tmp % 10);
      else if (base === 11) sum += tmp;
      else throw new Error('Base de cálculo do Digito Validador desconhecido.');
      factor = this.nextFactor(factor, base);
    }
    return sum;
  }

  public DVsub(sum, base) {
    return base - (sum % base);
  }

  public DV10(num) {
    return this.DVsub(this.sumDigitsByBaseWithFactor(num, 10), 10);
  }

  // titulos quando > 9 = 1, e consórcio quando > 9 = 0
  public DV11(num, isTitulo) {
    const dv = this.DVsub(this.sumDigitsByBaseWithFactor(num, 11), 11);
    return dv > 9 ? +isTitulo : dv;
  }

  public isValidCurrencyCode(currencyCode: string[1]) {
    if (currencyCode !== '9')
      throw new BadRequestException('Valor da moeda deve ser 9 (real).');
  }
}
