import { ResultCode } from '../../enum/result-code.enum';

export type ExceptionResultType<T> = {
  data: T;
  code: ResultCode;
  field?: string;
  message?: string;
  response?: string;
};
