import { IsEnum } from 'class-validator';
import { LikeStatus } from '../../../enum/like-status.enum';

export class LikeStatusInputDto {
  @IsEnum(LikeStatus)
  likeStatus: string;
}
