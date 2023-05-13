import { IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { blogNotFound } from '../../exceptions/exception.constants';
import { isBlogExist } from '../../exceptions/decorators/blog-exists.decorator';

export class PostInputDto {
  @IsNotEmpty()
  @MaxLength(30)
  title: string;

  @IsNotEmpty()
  @MaxLength(100)
  shortDescription: string;

  @IsNotEmpty()
  @MaxLength(1000)
  content: string;

  @IsOptional()
  @isBlogExist({
    message: blogNotFound,
  })
  blogId: string;
}
