import { IsNotEmpty, IsString } from 'class-validator';

export class AnswerInputDto {
  @IsNotEmpty()
  @IsString()
  answer: string;
}
