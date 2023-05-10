import { IsString, Length } from 'class-validator';

export class CommentInputDto {
  @IsString()
  @Length(20, 300)
  content: string;
}
