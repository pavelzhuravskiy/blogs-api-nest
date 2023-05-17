import { IsIn } from 'class-validator';

export class LikeStatusInputDto {
  @IsIn(['None', 'Like', 'Dislike'])
  likeStatus: string;
}
