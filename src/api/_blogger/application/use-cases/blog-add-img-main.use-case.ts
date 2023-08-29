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
import { BlogMainImage } from '../../../entities/blogs/blog-image-main.entity';
import { DataSourceRepository } from '../../../infrastructure/repositories/common/data-source.repository';

export class BlogAddMainImageCommand {
  constructor(
    public blogId: string,
    public userId: string,
    public buffer: Buffer,
    public mimetype: string,
    public originalName: string,
  ) {}
}

@CommandHandler(BlogAddMainImageCommand)
export class BlogAddMainImageUseCase
  implements ICommandHandler<BlogAddMainImageCommand>
{
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly dataSourceRepository: DataSourceRepository,
    private readonly s3Adapter: S3Adapter,
  ) {}

  async execute(
    command: BlogAddMainImageCommand,
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

    const s3Key = `blog/img/main/${command.blogId}_${command.originalName}`;

    await this.s3Adapter.uploadBlogMainImage(
      s3Key,
      command.buffer,
      command.mimetype,
    );

    const image = sharp(command.buffer);
    const metadata = await image.metadata();

    const blogMainImageRecord =
      await this.blogsRepository.findBlogMainImageRecord(command.blogId);

    let mainImage;

    if (!blogMainImageRecord.blogMainImage) {
      mainImage = new BlogMainImage();
    } else {
      mainImage = blogMainImageRecord.blogMainImage;
    }

    mainImage.blog = blog;
    mainImage.url = s3Key;
    mainImage.width = metadata.width;
    mainImage.height = metadata.height;
    mainImage.size = metadata.size;

    await this.dataSourceRepository.save(mainImage);

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
