import { IsString, Length } from 'class-validator';

export class NewPasswordInputDto {
  @Length(6, 20)
  newPassword: string;

  @IsString()
  recoveryCode: string;
}
