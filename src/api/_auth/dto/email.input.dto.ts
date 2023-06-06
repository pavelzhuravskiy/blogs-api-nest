import { IsEmail } from 'class-validator';

export class EmailInputDto {
  @IsEmail()
  email: string;
}
