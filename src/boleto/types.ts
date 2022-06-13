export type VerificationNumber = string[1];

// boleto de tipo título
export interface TituloBarCode {
  kind: 'TituloBarCode';
  barCode: string[44];
  bankCode: string[3];
  currencyCode: string[1];
  verificationNumber: VerificationNumber;
  dueDateFactor: string[4];
  value: string[10];
  rest: string[25];
}

export interface TituloDigits {
  kind: 'TituloDigits';
  barCode: string[47];
  field1: TituloDigitsField1;
  field2: TituloDigitsField2;
  field3: TituloDigitsField3;
  field4: VerificationNumber;
  field5: TituloDigitsField5;
}

export interface TituloDigitsField1 {
  bankCode: string[3];
  currencyCode: string[1];
  rest20to24: string[5];
  verificationNumber: VerificationNumber;
}

export interface TituloDigitsField2 {
  rest25to34: string[10];
  verificationNumber: VerificationNumber;
}

export interface TituloDigitsField3 {
  rest35to44: string[10];
  verificationNumber: VerificationNumber;
}

export interface TituloDigitsField5 {
  dueDateFactor: string[4];
  value: string[10];
}

// boleto de tipo convenio
export interface ConvenioBarCode {
  kind: 'ConvenioBarCode';
  barCode: string[44];
  productId: string[1];
  segmentId: string[1];
  valueId: string[1];
  verificationNumber: VerificationNumber;
  value: string[11];
  entityId: string[4] | string[8];
  dueDate?: string[8];
  rest: string[25] | string[21] | string[17];
}

export interface ConvenioDigits {
  kind: 'ConvenioDigits';
  barCode: string[48];
  productId: string[1];
  segmentId: string[1];
  valueId: string[1];
  verificationNumber: VerificationNumber;
  value: string[11];
  entityId: string[4] | string[8];
  dueDate?: string[8];
  rest: string[25] | string[17] | string[13];
  verificationNumberField1: VerificationNumber;
  verificationNumberField2: VerificationNumber;
  verificationNumberField3: VerificationNumber;
  verificationNumberField4: VerificationNumber;
}

export type Boleto =
  | ConvenioBarCode
  | ConvenioDigits
  | TituloBarCode
  | TituloDigits;
