import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikeStatusInputDto } from '../../../../dto/likes/input/like-status.input.dto';
import { PostsRepository } from '../../../../infrastructure/posts/posts.repository';
import { ExceptionResultType } from '../../../../../exceptions/types/exception-result.type';
import { ResultCode } from '../../../../../enums/result-code.enum';
import {
  userIDField,
  userNotFound,
} from '../../../../../exceptions/exception.constants';
import { UsersRepository } from '../../../../infrastructure/users/users.repository';

export class LikeUpdateForPostCommand {
  constructor(
    public likeStatusInputDto: LikeStatusInputDto,
    public postId: string,
    public userId: number,
  ) {}
}

@CommandHandler(LikeUpdateForPostCommand)
export class LikeUpdateForPostUseCase
  implements ICommandHandler<LikeUpdateForPostCommand>
{
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(
    command: LikeUpdateForPostCommand,
  ): Promise<ExceptionResultType<boolean>> {
    const post = await this.postsRepository.findPost(command.postId);

    if (!post) {
      return null;
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

    const userPostLikeRecord =
      await this.postsRepository.findUserPostLikeRecord(post.id, user.id);

    if (userPostLikeRecord) {
      await this.postsRepository.updateLikeStatus(
        command.likeStatusInputDto.likeStatus,
        post.id,
        user.id,
      );
    } else {
      await this.postsRepository.createUserPostLikeRecord(
        post.id,
        user.id,
        command.likeStatusInputDto.likeStatus,
      );
    }

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
