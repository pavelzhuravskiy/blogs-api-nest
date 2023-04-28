import { ErrorCodes } from '../enums/error.codes';
import { BadRequestException, NotFoundException } from '@nestjs/common';

export const errorHandler = (code: ErrorCodes) => {
  switch (code) {
    case ErrorCodes.BadRequest: {
      throw new BadRequestException();
    }
    case ErrorCodes.NotFound: {
      throw new NotFoundException();
    }
  }
};
