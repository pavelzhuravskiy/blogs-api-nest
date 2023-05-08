import { ExceptionCode } from './exception-codes.enum';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

export const exceptionHandler = (
  code: ExceptionCode,
  message?: string,
  field?: string,
) => {
  const exceptionObject = {
    message: [
      {
        message: message,
        field: field,
      },
    ],
  };

  switch (code) {
    case ExceptionCode.BadRequest: {
      throw new BadRequestException(exceptionObject);
    }
    case ExceptionCode.NotFound: {
      throw new NotFoundException(exceptionObject);
    }
    case ExceptionCode.Forbidden: {
      throw new ForbiddenException(exceptionObject);
    }
  }
};
