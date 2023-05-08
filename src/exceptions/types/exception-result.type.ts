import { ExceptionCode } from '../exception-codes.enum';

export type ExceptionResultType<T> = {
  data: T;
  code: ExceptionCode;
  field?: string;
  message?: string;
};
