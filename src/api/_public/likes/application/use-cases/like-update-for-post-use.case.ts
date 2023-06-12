import { InjectModel } from '@nestjs/mongoose';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  PostMongooseEntity,
  PostModelType,
} from '../../../../entities/_mongoose/post.entity';
import { PostsMongooseRepository } from '../../../../infrastructure/_mongoose/posts/posts.repository';
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
    @InjectModel(PostMongooseEntity.name)
    private PostModel: PostModelType,
    private readonly postsRepository: PostsMongooseRepository,
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
