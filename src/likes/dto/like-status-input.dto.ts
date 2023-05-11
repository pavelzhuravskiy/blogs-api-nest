import { IsIn, IsString } from 'class-validator';

export class LikeStatusInputDto {
  @IsString()
  @IsIn(['None', 'Like', 'Dislike'])
  likeStatus: string;
}
