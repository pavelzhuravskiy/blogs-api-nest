import { InjectModel } from '@nestjs/mongoose';
import { BlogsRepository } from '../../../infrastructure/blogs/blogs.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ExceptionResultType } from '../../../../exceptions/types/exception-result.type';
import { ResultCode } from '../../../../enums/result-code.enum';
import {
  blogIDField,
  blogNotFound,
  userIDField,
  userNotFound,
} from '../../../../exceptions/exception.constants';
import { PostInputDto } from '../../../dto/posts/input/post.input.dto';
import { Post, PostModelType } from '../../../entities/_mongoose/post.entity';
import { PostsRepository } from '../../../infrastructure/posts/posts.repository';
import { UsersMongooseRepository } from '../../../infrastructure/_mongoose/users/users.mongoose.repository';

export class PostCreateCommand {
  constructor(
    public postInputDto: PostInputDto,
    public blogId: string,
    public userId: string,
  ) {}
}

@CommandHandler(PostCreateCommand)
export class PostCreateUseCase implements ICommandHandler<PostCreateCommand> {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository,
    private readonly usersRepository: UsersMongooseRepository,
  ) {}

  async execute(
    command: PostCreateCommand,
  ): Promise<ExceptionResultType<boolean>> {
    const blog = await this.blogsRepository.findBlog(command.blogId);

    if (!blog) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: blogIDField,
        message: blogNotFound,
      };
    }

    if (blog.blogOwnerInfo.userId !== command.userId) {
      return {
        data: false,
        code: ResultCode.Forbidden,
      };
    }

    const user = await this.usersRepository.findUserById(command.userId);

    if (!user) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: userIDField,
        message: userNotFound,
      };
    }

    const post = this.PostModel.createPost(
      this.PostModel,
      command.postInputDto,
      blog,
    );

    await this.postsRepository.save(post);

    return {
      data: true,
      code: ResultCode.Success,
      response: post.id,
    };
  }
}
