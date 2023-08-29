import { BadRequestException } from '@nestjs/common';
import { exceptionObjectType } from './types/exception-object.type';

export const exceptionImagesFactory = (errorMessage: string) => {
  const errorObj: exceptionObjectType[] = [
    {
      message: errorMessage,
      field: 'image',
    },
  ];

  throw new BadRequestException(errorObj);
};
