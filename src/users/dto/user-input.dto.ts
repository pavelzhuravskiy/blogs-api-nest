import { IsEmail, IsString, Length, Matches } from 'class-validator';
import { IsUserAlreadyExist } from '../../exceptions/decorators/unique-user.decorator';
import {
  emailNotUnique,
  loginNotUnique,
} from '../../exceptions/exception.constants';

export class UserInputDto {
  @IsString()
  @Length(3, 10)
  @Matches(/^[a-zA-Z0-9_-]*$/)
  @IsUserAlreadyExist({
    message: loginNotUnique,
  })
  login: string;

  @IsString()
  @Length(6, 20)
  password: string;

  @IsEmail()
  @IsUserAlreadyExist({
    message: emailNotUnique,
  })
  email: string;
}
