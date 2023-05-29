import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../superadmin/users/infrastructure/users.repository';
import { ResultCode } from '../../../../enums/result-code.enum';
import {
  userIDField,
  userIsBanned,
  userIsUnbanned,
  userNotFound,
} from '../../../../exceptions/exception.constants';
import { ExceptionResultType } from '../../../../exceptions/types/exception-result.type';
import { PostsRepository } from '../../../public/posts/infrastructure/posts.repository';
import { BlogsRepository } from '../../../public/blogs/infrastructure/blogs.repository';
import { CommentsRepository } from '../../../public/comments/infrastructure/comments.repository';
import { LikesRepository } from '../../../public/likes/infrastructure/likes.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from '../../../public/posts/post.entity';
import {
  Comment,
  CommentModelType,
} from '../../../public/comments/comment.entity';
import { BloggerUserBanInputDto } from '../../dto/user-ban.input.dto';

export class BloggerUserBanCommand {
  constructor(
    public bloggerUserBanInputDto: BloggerUserBanInputDto,
    public userId: string,
  ) {}
}

@CommandHandler(BloggerUserBanCommand)
export class BloggerUserBanUseCase
  implements ICommandHandler<BloggerUserBanCommand>
{
  constructor(
    private commandBus: CommandBus,
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
    private readonly usersRepository: UsersRepository,
    private readonly blogsRepository: BlogsRepository,
    private readonly postsRepository: PostsRepository,
    private readonly commentsRepository: CommentsRepository,
    private readonly likesRepository: LikesRepository,
  ) {}

  async execute(
    command: BloggerUserBanCommand,
  ): Promise<ExceptionResultType<boolean>> {
    const user = await this.usersRepository.findUserById(command.userId);

    if (!user) {
      return {
        data: false,
        code: ResultCode.BadRequest,
        field: userIDField,
        message: userNotFound,
      };
    }

    const blog = await this.blogsRepository.findBlog(
      command.bloggerUserBanInputDto.blogId,
    );

    const isAlreadyBanned = await this.blogsRepository.findUserIdInBannedBlog(
      blog.id,
      command.userId,
    );

    if (command.bloggerUserBanInputDto.isBanned) {
      if (isAlreadyBanned) {
        return {
          data: false,
          code: ResultCode.BadRequest,
          field: userIDField,
          message: userIsBanned,
        };
      }

      await this.blogsRepository.pushUserInBannedUsersArray(
        blog.id,
        command.userId,
      );
    } else {
      if (!isAlreadyBanned) {
        return {
          data: false,
          code: ResultCode.BadRequest,
          field: userIDField,
          message: userIsUnbanned,
        };
      }

      await this.blogsRepository.pullUserFromBannedUsersArray(
        blog.id,
        command.userId,
      );
    }

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
