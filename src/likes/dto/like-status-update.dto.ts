import { IsString } from 'class-validator';
import { LikeStatus } from '../like-status.enum';

export class LikeStatusUpdateDto {
  @IsString()
  likeStatus: LikeStatus;
}
