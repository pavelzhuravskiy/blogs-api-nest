import { IsEnum } from 'class-validator';
import { LikeStatus } from '../../../enums/like-status.enum';

export class LikeStatusInputDto {
  @IsEnum(LikeStatus)
  likeStatus: string;
}
