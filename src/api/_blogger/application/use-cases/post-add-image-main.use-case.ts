import { CommandHandler } from '@nestjs/cqrs';
import { DataSource, EntityManager } from 'typeorm';
import { TransactionBaseUseCase } from '../../../_common/application/use-cases/transaction-base.use-case';
import { TransactionsRepository } from '../../../infrastructure/repositories/common/transactions.repository';
import { ResultCode } from '../../../../enums/result-code.enum';
import {
  blogIDField,
  blogNotFound,
  postIDField,
  postNotFound,
} from '../../../../exceptions/exception.constants';
import sharp from 'sharp';
import { BlogsTransactionsRepository } from '../../../infrastructure/repositories/blogs/blogs.transactions.repository';
import { ExceptionResultType } from '../../../../exceptions/types/exception-result.type';
import { PostsTransactionsRepository } from '../../../infrastructure/repositories/posts/posts.transactions.repository';
import { S3Adapter } from '../../../infrastructure/aws/s3.adapter';
import { PostMainImage } from '../../../entities/posts/post-image-main.entity';

export class PostAddMainImageCommand {
  constructor(
    public blogId: string,
    public postId: string,
    public userId: string,
    public buffer: Buffer,
    public mimetype: string,
    public originalName: string,
  ) {}
}

@CommandHandler(PostAddMainImageCommand)
export class PostAddMainImageUseCase extends TransactionBaseUseCase<
  PostAddMainImageCommand,
  ExceptionResultType<boolean>
> {
  constructor(
    protected readonly dataSource: DataSource,
    protected readonly transactionsRepository: TransactionsRepository,
    protected readonly blogsTransactionsRepository: BlogsTransactionsRepository,
    protected readonly postsTransactionsRepository: PostsTransactionsRepository,
    private readonly s3Adapter: S3Adapter,
  ) {
    super(dataSource);
  }

  async doLogic(
    command: PostAddMainImageCommand,
    manager: EntityManager,
  ): Promise<ExceptionResultType<boolean>> {
    const blog = await this.blogsTransactionsRepository.findBlogWithOwner(
      command.blogId,
      manager,
    );

    if (!blog) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: blogIDField,
        message: blogNotFound,
      };
    }

    const post = await this.postsTransactionsRepository.findPostById(
      command.postId,
      manager,
    );

    if (!post) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: postIDField,
        message: postNotFound,
      };
    }

    if (blog.user.id !== command.userId) {
      return {
        data: false,
        code: ResultCode.Forbidden,
      };
    }

    // Uploading original image to S3 and saving metadata in db
    const originalImageS3Key = `post/img/main/${command.postId}_L_${command.originalName}`;
    await this.s3Adapter.uploadImage(
      originalImageS3Key,
      command.buffer,
      command.mimetype,
    );

    const originalImageSharpInstance = sharp(command.buffer);
    const originalImageMetadata = await originalImageSharpInstance.metadata();

    const largeImage = new PostMainImage();
    largeImage.post = post;
    largeImage.url = originalImageS3Key;
    largeImage.width = originalImageMetadata.width;
    largeImage.height = originalImageMetadata.height;
    largeImage.size = originalImageMetadata.size;

    await this.transactionsRepository.save(largeImage, manager);

    // Uploading medium image to S3 and saving metadata in db
    const mediumImageBuffer = await sharp(command.buffer)
      .resize({ width: 300, height: 180 })
      .toBuffer();

    const mediumImageS3Key = `post/img/main/${command.postId}_M_${command.originalName}`;
    await this.s3Adapter.uploadImage(
      mediumImageS3Key,
      mediumImageBuffer,
      command.mimetype,
    );

    const mediumImageSharpInstance = sharp(mediumImageBuffer);
    const mediumImageMetadata = await mediumImageSharpInstance.metadata();

    const mediumImage = new PostMainImage();
    mediumImage.post = post;
    mediumImage.url = mediumImageS3Key;
    mediumImage.width = mediumImageMetadata.width;
    mediumImage.height = mediumImageMetadata.height;
    mediumImage.size = mediumImageMetadata.size;

    await this.transactionsRepository.save(mediumImage, manager);

    // Uploading small image to S3 and saving metadata in db
    const smallImageBuffer = await sharp(command.buffer)
      .resize({ width: 149, height: 96 })
      .toBuffer();

    const smallImageS3Key = `post/img/main/${command.postId}_S_${command.originalName}`;
    await this.s3Adapter.uploadImage(
      smallImageS3Key,
      smallImageBuffer,
      command.mimetype,
    );

    const smallImageSharpInstance = sharp(smallImageBuffer);
    const smallImageMetadata = await smallImageSharpInstance.metadata();

    const smallImage = new PostMainImage();
    smallImage.post = post;
    smallImage.url = smallImageS3Key;
    smallImage.width = smallImageMetadata.width;
    smallImage.height = smallImageMetadata.height;
    smallImage.size = smallImageMetadata.size;

    await this.transactionsRepository.save(smallImage, manager);

    return {
      data: true,
      code: ResultCode.Success,
    };
  }

  public async execute(command: PostAddMainImageCommand) {
    return super.execute(command);
  }
}
