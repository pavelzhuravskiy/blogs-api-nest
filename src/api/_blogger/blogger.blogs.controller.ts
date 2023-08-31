import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseFilePipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { BlogInputDto } from '../dto/blogs/input/blog.input.dto';
import { CommandBus } from '@nestjs/cqrs';
import { BlogCreateCommand } from './application/use-cases/blog-create.use-case';
import { JwtBearerGuard } from '../_auth/guards/jwt-bearer.guard';
import { UserIdFromGuard } from '../_auth/decorators/user-id-from-guard.decorator';
import { exceptionHandler } from '../../exceptions/exception.handler';
import { ResultCode } from '../../enums/result-code.enum';
import {
  userIDField,
  userNotFound,
} from '../../exceptions/exception.constants';
import { BlogUpdateCommand } from './application/use-cases/blog-update.use-case';
import { BlogDeleteCommand } from './application/use-cases/blog-delete.use-case';
import { PostInputDto } from '../dto/posts/input/post.input.dto';
import { PostUpdateCommand } from './application/use-cases/post-update.use-case';
import { PostCreateCommand } from './application/use-cases/post-create.use-case';
import { PostDeleteCommand } from './application/use-cases/post-delete.use-case';
import { BlogsQueryRepository } from '../infrastructure/repositories/blogs/blogs.query.repository';
import { BlogQueryDto } from '../dto/blogs/query/blog.query.dto';
import { PostsQueryRepository } from '../infrastructure/repositories/posts/posts.query.repository';
import { CommentQueryDto } from '../dto/comments/query/comment.query.dto';
import { CommentsQueryRepository } from '../infrastructure/repositories/comments/comments.query.repository';
import { BlogAddMainImageCommand } from './application/use-cases/blog-add-image-main.use-case';
import { FileInterceptor } from '@nestjs/platform-express';
import { exceptionImagesFactory } from '../../exceptions/exception-images.factory';
import { ImageValidator } from '../../exceptions/validators/image-validator';
import { BlogAddWallpaperImageCommand } from './application/use-cases/blog-add-image-wp.use-case';
import { PostAddMainImageCommand } from './application/use-cases/post-add-image-main.use-case';

@Controller('blogger/blogs')
export class BloggerBlogsController {
  constructor(
    private commandBus: CommandBus,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @UseGuards(JwtBearerGuard)
  @Post()
  async createBlog(
    @Body() blogInputDto: BlogInputDto,
    @UserIdFromGuard() userId: string,
  ) {
    const blogId = await this.commandBus.execute(
      new BlogCreateCommand(blogInputDto, userId),
    );

    if (!blogId) {
      return exceptionHandler(ResultCode.NotFound, userNotFound, userIDField);
    }

    return this.blogsQueryRepository.findBlog(blogId);
  }

  @UseGuards(JwtBearerGuard)
  @Get()
  async findBlogs(
    @Query() query: BlogQueryDto,
    @UserIdFromGuard() userId: string,
  ) {
    return this.blogsQueryRepository.findBlogsOfCurrentBlogger(query, userId);
  }

  @UseGuards(JwtBearerGuard)
  @Put(':id')
  @HttpCode(204)
  async updateBlog(
    @Body() blogInputDto: BlogInputDto,
    @Param('id') blogId: string,
    @UserIdFromGuard() userId: string,
  ) {
    const result = await this.commandBus.execute(
      new BlogUpdateCommand(blogInputDto, blogId, userId),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }

  @UseGuards(JwtBearerGuard)
  @Delete(':id')
  @HttpCode(204)
  async deleteBlog(
    @Param('id') blogId: string,
    @UserIdFromGuard() userId: string,
  ) {
    const result = await this.commandBus.execute(
      new BlogDeleteCommand(blogId, userId),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }

  @UseGuards(JwtBearerGuard)
  @Post(':id/posts')
  async createPost(
    @Body() postInputDto: PostInputDto,
    @Param('id') blogId: string,
    @UserIdFromGuard() userId: string,
  ) {
    const result = await this.commandBus.execute(
      new PostCreateCommand(postInputDto, blogId, userId),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return this.postsQueryRepository.findPost(result.response, userId);
  }

  @UseGuards(JwtBearerGuard)
  @Put(':blogId/posts/:postId')
  @HttpCode(204)
  async updatePost(
    @Body() postInputDto: PostInputDto,
    @Param() params: { blogId: string; postId: string },
    @UserIdFromGuard() userId: string,
  ) {
    const result = await this.commandBus.execute(
      new PostUpdateCommand(postInputDto, params.blogId, params.postId, userId),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }

  @UseGuards(JwtBearerGuard)
  @Delete(':blogId/posts/:postId')
  @HttpCode(204)
  async deletePost(
    @Param() params: { blogId: string; postId: string },
    @UserIdFromGuard() userId: string,
  ) {
    const result = await this.commandBus.execute(
      new PostDeleteCommand(params.blogId, params.postId, userId),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }

  @UseGuards(JwtBearerGuard)
  @Get('comments')
  async findComments(
    @Query() query: CommentQueryDto,
    @UserIdFromGuard() userId: string,
  ) {
    return this.commentsQueryRepository.findCommentsOfBloggerPosts(
      query,
      userId,
    );
  }

  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(JwtBearerGuard)
  @Post(':blogId/images/main')
  async uploadBlogMainImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new ImageValidator(156, 156, 100000)],
        exceptionFactory: exceptionImagesFactory,
      }),
    )
    file: Express.Multer.File,
    @Param('blogId') blogId: string,
    @UserIdFromGuard() userId: string,
  ) {
    const result = await this.commandBus.execute(
      new BlogAddMainImageCommand(
        blogId,
        userId,
        file.buffer,
        file.mimetype,
        file.originalname,
      ),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return this.blogsQueryRepository.findBlogImages(blogId);
  }

  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(JwtBearerGuard)
  @Post(':blogId/images/wallpaper')
  async uploadBlogWallpaperImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new ImageValidator(1028, 312, 100000)],
        exceptionFactory: exceptionImagesFactory,
      }),
    )
    file: Express.Multer.File,
    @Param('blogId') blogId: string,
    @UserIdFromGuard() userId: string,
  ) {
    const result = await this.commandBus.execute(
      new BlogAddWallpaperImageCommand(
        blogId,
        userId,
        file.buffer,
        file.mimetype,
        file.originalname,
      ),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return this.blogsQueryRepository.findBlogImages(blogId);
  }

  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(JwtBearerGuard)
  @Post(':blogId/posts/:postId/images/main')
  async uploadPostMainImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new ImageValidator(940, 432, 100000)],
        exceptionFactory: exceptionImagesFactory,
      }),
    )
    file: Express.Multer.File,
    @Param() params: { blogId: string; postId: string },
    @UserIdFromGuard() userId: string,
  ) {
    const result = await this.commandBus.execute(
      new PostAddMainImageCommand(
        params.blogId,
        params.postId,
        userId,
        file.buffer,
        file.mimetype,
        file.originalname,
      ),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;

    // return this.blogsQueryRepository.findBlogImages(blogId);
  }
}
