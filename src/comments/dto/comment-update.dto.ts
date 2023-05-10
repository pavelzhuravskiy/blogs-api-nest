import { IsString, Length } from 'class-validator';

export class CommentUpdateDto {
  @IsString()
  @Length(20, 300)
  content: string;
}
