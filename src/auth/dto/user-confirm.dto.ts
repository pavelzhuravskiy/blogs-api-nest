import { IsString } from 'class-validator';

export class UserConfirmDto {
  @IsString()
  code: string;
}
