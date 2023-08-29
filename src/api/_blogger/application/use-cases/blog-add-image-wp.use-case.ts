import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ExceptionResultType } from '../../../../exceptions/types/exception-result.type';
import { ResultCode } from '../../../../enums/result-code.enum';
import {
  blogIDField,
  blogNotFound,
} from '../../../../exceptions/exception.constants';
import { BlogsRepository } from '../../../infrastructure/repositories/blogs/blogs.repository';
import { S3Adapter } from '../../../infrastructure/aws/s3-adapter';
import sharp from 'sharp';
import { DataSourceRepository } from '../../../infrastructure/repositories/common/data-source.repository';
import { BlogWallpaperImage } from '../../../entities/blogs/blog-image-wallpaper.entity';

export class BlogAddWallpaperImageCommand {
  constructor(
    public blogId: string,
    public userId: string,
    public buffer: Buffer,
    public mimetype: string,
    public originalName: string,
  ) {}
}

@CommandHandler(BlogAddWallpaperImageCommand)
export class BlogAddWallpaperImageUseCase
  implements ICommandHandler<BlogAddWallpaperImageCommand>
{
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly dataSourceRepository: DataSourceRepository,
    private readonly s3Adapter: S3Adapter,
  ) {}

  async execute(
    command: BlogAddWallpaperImageCommand,
  ): Promise<ExceptionResultType<boolean>> {
    const blog = await this.blogsRepository.findBlogWithOwner(command.blogId);

    if (!blog) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: blogIDField,
        message: blogNotFound,
      };
    }

    if (blog.user.id !== command.userId) {
      return {
        data: false,
        code: ResultCode.Forbidden,
      };
    }

    const s3Key = `blog/img/wallpapers/${command.blogId}_${command.originalName}`;

    await this.s3Adapter.uploadImage(s3Key, command.buffer, command.mimetype);

    const image = sharp(command.buffer);
    const metadata = await image.metadata();

    let wallpaperImage =
      await this.blogsRepository.findBlogWallpaperImageRecord(command.blogId);

    if (!wallpaperImage) {
      wallpaperImage = new BlogWallpaperImage();
    }

    wallpaperImage.blog = blog;
    wallpaperImage.url = s3Key;
    wallpaperImage.width = metadata.width;
    wallpaperImage.height = metadata.height;
    wallpaperImage.size = metadata.size;

    await this.dataSourceRepository.save(wallpaperImage);

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
