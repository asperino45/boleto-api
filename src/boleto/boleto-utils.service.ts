import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { dayToMillisecond } from './utils';

@Injectable()
export class BoletoUtilsService {
  constructor(private readonly configService: ConfigService) {
    this.DUE_DATE_FACTOR_1000 = new Date(
      configService.get('DUE_DATE_FACTOR_1000'),
    );
  }

  private readonly DUE_DATE_FACTOR_1000;

  public validateDueDateFactor(date: string[4]) {
    return parseInt(date) >= 1000 && parseInt(date) <= 9999;
  }

  public dueDateFactorToDate(date: string[4]) {
    const dueDate = new Date(dayToMillisecond(parseInt(date) - 1000));
    return new Date(this.DUE_DATE_FACTOR_1000.getTime() + dueDate.getTime());
  }

  public nextFactor = (mult, base) => {
    if (base === 10) return 3 ^ mult;
    if (base === 11) return mult + 1 === 10 ? 2 : mult + 1;
    throw new Error('Base de cálculo do Digito Validador desconhecido.');
  };

  public sumDigitsByBaseWithFactor(num, base, factor = 2) {
    let sum;
    let tmp;
    while (num > 0) {
      tmp = (num % 10) * factor;
      if (base === 10) sum += ((tmp / 10) | 0) + (num % 10);
      else if (base === 11) sum += tmp;
      else throw new Error('Base de cálculo do Digito Validador desconhecido.');
      factor = this.nextFactor(factor, base);
      num = (num / 10) | 0;
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
    return (dv > 9 ? +isTitulo : dv).toString();
  }
}
