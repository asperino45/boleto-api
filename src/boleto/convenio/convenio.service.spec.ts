import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { BoletoUtilsService } from '../boleto-utils.service';
import { ConvenioService } from './convenio.service';

describe.skip('ConvenioService', () => {
  let service: ConvenioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConvenioService, BoletoUtilsService, ConfigService],
    }).compile();

    service = module.get<ConvenioService>(ConvenioService);
  });

  it.skip('should be defined', () => {
    expect(service).toBeDefined();
  });

  it.skip('should parse bar code', () => {
    throw new Error();
  });

  it.skip('should parse digits', () => {
    throw new Error();
  });

  it.skip('should throw when general Bar Code DV is invalid', () => {
    throw new Error();
  });

  it.skip('should throw when any of the Digits DV is invalid', () => {
    throw new Error();
  });

  it.skip('should correctly parse a date string in bar code', () => {
    throw new Error();
  });

  it.skip('should use the DV 10 mod algorithm when value type id is 6', () => {
    throw new Error();
  });

  it.skip('should use the DV 10 mod algorithm when value type id is 7', () => {
    throw new Error();
  });

  it.skip('should use the DV 11 mod algorithm when value type id is 8', () => {
    throw new Error();
  });

  it.skip('should use the DV 11 mod algorithm when value type id is 9', () => {
    throw new Error();
  });

  it.skip('should calculate the correct DV for mod 10 algorithm', () => {
    throw new Error();
  });

  it.skip('should calculate the correct DV for mod 11 algorithm', () => {
    throw new Error();
  });

  it.skip('should parse bar code correctly with CNPJ', () => {
    throw new Error();
  });

  it.skip('should parse bar code correctly with date', () => {
    throw new Error();
  });

  it.skip('should parse bar code correctly without CNPJ', () => {
    throw new Error();
  });

  it.skip('should parse bar code correctly without date', () => {
    throw new Error();
  });

  it.skip('should parse bar code correctly without date or CNPJ', () => {
    throw new Error();
  });

  it.skip('should parse bar code correctly with date and CNPJ', () => {
    throw new Error();
  });
});
