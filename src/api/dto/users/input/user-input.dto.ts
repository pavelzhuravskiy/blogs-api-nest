import { IsEmail, Length, Matches } from 'class-validator';

export class UserInputDto {
  @Length(3, 10)
  @Matches(/^[a-zA-Z0-9_-]*$/)
  /*@IsLoginExist({
    message: loginNotUnique,
  })*/ // TODO
  login: string;

  @Length(6, 20)
  password: string;

  @IsEmail()
  /*@IsEmailExist({
    message: emailNotUnique,
  })*/ // TODO
  email: string;
}
