import { ExceptionCodes } from '../exception-codes.enum';

export type ExceptionResultType<T> = {
  data: T;
  code: ExceptionCodes;
  field: string;
  message: string;
};
