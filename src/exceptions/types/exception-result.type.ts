import { ResultCode } from '../exception-codes.enum';

export type ExceptionResultType<T> = {
  data: T;
  code: ResultCode;
  field?: string;
  message?: string;
  response?: string;
};
