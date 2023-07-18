import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikeStatusInputDto } from '../../../../dto/likes/input/like-status.input.dto';
import { PostsRepository } from '../../../../infrastructure/repositories/posts/posts.repository';
import { ExceptionResultType } from '../../../../../exceptions/types/exception-result.type';
import { ResultCode } from '../../../../../enums/result-code.enum';
import {
  userIDField,
  userNotFound,
} from '../../../../../exceptions/exception.constants';
import { UsersRepository } from '../../../../infrastructure/repositories/users/users.repository';
import { PostLike } from '../../../../entities/posts/post-like.entity';
import { DataSourceRepository } from '../../../../infrastructure/repositories/common/data-source.repository';

export class LikeUpdateForPostCommand {
  constructor(
    public likeStatusInputDto: LikeStatusInputDto,
    public postId: string,
    public userId: string,
  ) {}
}

@CommandHandler(LikeUpdateForPostCommand)
export class LikeUpdateForPostUseCase
  implements ICommandHandler<LikeUpdateForPostCommand>
{
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly dataSourceRepository: DataSourceRepository,
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

    let likeRecord;

    if (userPostLikeRecord) {
      likeRecord = userPostLikeRecord;
    } else {
      likeRecord = new PostLike();
    }

    likeRecord.post = post;
    likeRecord.user = user;
    likeRecord.likeStatus = command.likeStatusInputDto.likeStatus;
    likeRecord.addedAt = new Date();

    await this.dataSourceRepository.save(likeRecord);

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
