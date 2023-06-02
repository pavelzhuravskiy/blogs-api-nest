import { InjectModel } from '@nestjs/mongoose';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  Post,
  PostModelType,
} from '../../../../entities/_mongoose/post.entity';
import { PostsRepository } from '../../../../infrastructure/posts/posts.repository';
import { LikesDataType } from '../../../../dto/likes/schemas/likes-data.type';
import { LikesService } from '../likes.service';
import { LikeStatusInputDto } from '../../../../dto/likes/input/like-status.input.dto';

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
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    private readonly postsRepository: PostsRepository,
    private readonly likesService: LikesService,
  ) {}

  async execute(command: LikeUpdateForPostCommand): Promise<boolean | null> {
    const post = await this.postsRepository.findPost(command.postId);

    if (!post) {
      return null;
    }

    const data: LikesDataType = {
      commentOrPostId: command.postId,
      userId: command.userId,
      userIsBanned: post.blogInfo.blogOwnerIsBanned,
      likeStatus: command.likeStatusInputDto.likeStatus,
      likesCount: post.likesInfo.likesCount,
      dislikesCount: post.likesInfo.dislikesCount,
      model: this.PostModel,
    };

    return this.likesService.updateLikesData(data);
  }
}
