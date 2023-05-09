import { IsString } from 'class-validator';

export class EmailConfirmDto {
  @IsString()
  code: string;
}
