import { ErrorCodes } from '../common/enums/error-codes.enum';
import { BadRequestException, NotFoundException } from '@nestjs/common';

export const exceptionHandler = (
  code: ErrorCodes,
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
    case ErrorCodes.BadRequest: {
      throw new BadRequestException(exceptionObject);
    }
    case ErrorCodes.NotFound: {
      throw new NotFoundException(exceptionObject);
    }
  }
};
