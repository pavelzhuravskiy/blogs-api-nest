import { IsBoolean, IsNotEmpty } from 'class-validator';

export class QuestionPublishInputDto {
  @IsNotEmpty()
  @IsBoolean()
  published: boolean;
}
