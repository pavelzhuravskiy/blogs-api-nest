import { IsBoolean, MinLength } from 'class-validator';
import { blogNotFound } from '../../../exceptions/exception.constants';
import { isBlogExist } from '../../../exceptions/decorators/blog-exists.decorator';

export class BloggerUserBanInputDto {
  @IsBoolean()
  isBanned: boolean;

  @MinLength(20)
  banReason: string;

  @isBlogExist({
    message: blogNotFound,
  })
  blogId: string;
}
