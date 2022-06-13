import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNumberString,
  IsString,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Boleto } from '../types';
import { getDecimalValueString } from '../utils';

export class BoletoResponseDto {
  constructor(barCode: string[44], amount: string[11], expirationDate: Date) {
    this.barCode = barCode;
    this.amount = amount != null ? getDecimalValueString(amount) : null;
    this.expirationDate =
      expirationDate != null && !isNaN(expirationDate.getTime())
        ? expirationDate.toISOString().slice(0, 10)
        : null;
  }

  @IsString()
  @ApiProperty()
  readonly barCode: string;

  @IsString()
  @ApiProperty()
  readonly amount: string;

  @IsDateString()
  @ApiProperty()
  readonly expirationDate: string;
}

@ValidatorConstraint({ name: 'exactLength', async: false })
export class ExactLengthConstraint implements ValidatorConstraintInterface {
  validate(text: string, args: ValidationArguments) {
    return (
      typeof text === 'string' &&
      args.constraints.some((val) => val === text.length)
    );
  }

  defaultMessage(args: ValidationArguments) {
    return `Text should have exactly ${args.constraints.join(
      ', ',
    )} characters of length.`;
  }
}

export function ExactLength(
  constraints: number[],
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints,
      validator: ExactLengthConstraint,
    });
  };
}

export class BoletoRequestDto {
  boleto: Boleto;

  @ExactLength([44, 47, 48])
  @IsNumberString()
  @ApiProperty()
  readonly barCode: string;
}
