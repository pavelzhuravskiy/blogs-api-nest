import { IsString } from 'class-validator';

export class ConfirmCodeInputDto {
  @IsString()
  code: string;
}
