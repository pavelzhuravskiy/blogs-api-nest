import { Length } from 'class-validator';

export class NewPasswordDto {
  @Length(6, 20)
  newPassword: string;

  recoveryCode: string;
}
