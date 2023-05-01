import { IsString, Length } from 'class-validator';

export class CommentCreateDto {
  @IsString()
  @Length(20, 300)
  content: string;
}
