import { ValidationErrorsIBAN } from 'ibantools';

export { getFriendlyErrors };

const ibanErrorToMessageKey = {
  [ValidationErrorsIBAN.NoIBANProvided]: 'tools.iban-validator-and-parser.errors.noIbanProvided',
  [ValidationErrorsIBAN.NoIBANCountry]: 'tools.iban-validator-and-parser.errors.noIbanCountry',
  [ValidationErrorsIBAN.WrongBBANLength]: 'tools.iban-validator-and-parser.errors.wrongBbanLength',
  [ValidationErrorsIBAN.WrongBBANFormat]: 'tools.iban-validator-and-parser.errors.wrongBbanFormat',
  [ValidationErrorsIBAN.ChecksumNotNumber]: 'tools.iban-validator-and-parser.errors.checksumNotNumber',
  [ValidationErrorsIBAN.WrongIBANChecksum]: 'tools.iban-validator-and-parser.errors.wrongIbanChecksum',
  [ValidationErrorsIBAN.WrongAccountBankBranchChecksum]: 'tools.iban-validator-and-parser.errors.wrongAccountBankBranchChecksum',
  [ValidationErrorsIBAN.QRIBANNotAllowed]: 'tools.iban-validator-and-parser.errors.qrIbanNotAllowed',
};

function getFriendlyErrors(errorCodes: ValidationErrorsIBAN[]) {
  return errorCodes.map(errorCode => ibanErrorToMessageKey[errorCode]).filter(Boolean);
}
