import { ErrorCodes } from '../../common/enums/error-codes.enum';

export type ExceptionResultType<T> = {
  data: T;
  code: ErrorCodes;
  field: string;
  message: string;
};
