import { Length } from 'class-validator';

export class CommentInputDto {
  @Length(20, 300)
  content: string;
}
