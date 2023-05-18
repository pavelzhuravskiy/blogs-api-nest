import { Injectable } from '@nestjs/common';
import { LikesRepository } from '../../../infrastructure/likes.repository';
import { LikeStatus } from '../../../../../enums/like-status.enum';
import { LikesDataType } from '../../../schemas/likes-data.type';
import { UsersRepository } from '../../../../users/infrastructure/users.repository';

@Injectable()
export class LikesService {
  constructor(
    private readonly likesRepository: LikesRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async updateLikesData(data: LikesDataType): Promise<boolean | null> {
    const userInLikesInfo = await this.likesRepository.findUserInLikesInfo(
      data,
    );

    if (!userInLikesInfo) {
      const user = await this.usersRepository.findUserById(data.userId);
      const userLogin = user.accountData.login;

      await this.likesRepository.pushUserInLikesInfo(data, userLogin);

      if (data.likeStatus === LikeStatus.Like) {
        data.likesCount++;
      }

      if (data.likeStatus === LikeStatus.Dislike) {
        data.dislikesCount++;
      }

      return this.likesRepository.updateLikesCount(data);
    }

    const userLikeStatus = await this.likesRepository.findUserLikeStatus(data);

    switch (userLikeStatus) {
      case LikeStatus.None:
        if (data.likeStatus === LikeStatus.Like) {
          data.likesCount++;
        }

        if (data.likeStatus === LikeStatus.Dislike) {
          data.dislikesCount++;
        }
        break;

      case LikeStatus.Like:
        if (data.likeStatus === LikeStatus.None) {
          data.likesCount--;
        }

        if (data.likeStatus === LikeStatus.Dislike) {
          data.likesCount--;
          data.dislikesCount++;
        }
        break;

      case LikeStatus.Dislike:
        if (data.likeStatus === LikeStatus.None) {
          data.dislikesCount--;
        }

        if (data.likeStatus === LikeStatus.Like) {
          data.dislikesCount--;
          data.likesCount++;
        }
    }

    await this.likesRepository.updateLikesCount(data);
    return this.likesRepository.updateLikesStatus(data);
  }
}

// TODO Optimistic concurrency // INC?
