import { IsEmail, Length, Matches } from 'class-validator';
import { IsLoginExist } from '../../../../exceptions/decorators/unique-login.decorator';
import {
  emailNotUnique,
  loginNotUnique,
} from '../../../../exceptions/exception.constants';
import { IsEmailExist } from '../../../../exceptions/decorators/unique-email.decorator';

export class UserInputDto {
  @Length(3, 10)
  @Matches(/^[a-zA-Z0-9_-]*$/)
  @IsLoginExist({
    message: loginNotUnique,
  })
  login: string;

  @Length(6, 20)
  password: string;

  @IsEmail()
  @IsEmailExist({
    message: emailNotUnique,
  })
  email: string;
}
