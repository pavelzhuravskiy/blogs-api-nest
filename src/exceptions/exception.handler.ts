import { ExceptionCodes } from './exception-codes.enum';
import { BadRequestException, NotFoundException } from '@nestjs/common';

export const exceptionHandler = (
  code: ExceptionCodes,
  message: string,
  field: string,
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
    case ExceptionCodes.BadRequest: {
      throw new BadRequestException(exceptionObject);
    }
    case ExceptionCodes.NotFound: {
      throw new NotFoundException(exceptionObject);
    }
  }
};
