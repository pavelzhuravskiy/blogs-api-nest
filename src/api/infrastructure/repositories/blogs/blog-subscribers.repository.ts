import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogSubscriber } from '../../../entities/blogs/blog-subscriber.entity';

@Injectable()
export class BlogSubscribersRepository {
  constructor(
    @InjectRepository(BlogSubscriber)
    private readonly blogSubscribersRepository: Repository<BlogSubscriber>,
  ) {}

  // ***** Find blog subscribers operations *****
  async findActiveSubscriber(userId: string): Promise<BlogSubscriber | null> {
    try {
      return await this.blogSubscribersRepository
        .createQueryBuilder('bs')
        .where(`bs.userId = :userId`, { userId: userId })
        .getOne();
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async findRecordForSubscribe(
    blogId: string,
    userId: string,
  ): Promise<BlogSubscriber | null> {
    try {
      return await this.blogSubscribersRepository
        .createQueryBuilder('bs')
        .where(
          `(bs.userId = :userId and bs.blogId = :blogId) or (bs.userId = :userId and bs.subscriptionStatus = 'None')`,
          {
            blogId: blogId,
            userId: userId,
          },
        )
        .getOne();
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async findRecordForUnsubscribe(
    blogId: string,
    userId: string,
  ): Promise<BlogSubscriber | null> {
    try {
      const blogSubscriber = await this.blogSubscribersRepository
        .createQueryBuilder('bs')
        .where(`bs.userId = :userId`, {
          userId: userId,
        })
        .andWhere(`bs.blogId = :blogId`, {
          blogId: blogId,
        })
        .andWhere(`bs.subscriptionStatus = 'Subscribed'`)
        .getOne();
      console.log(blogSubscriber, 'bs');
      return blogSubscriber;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async findSubscriberByTelegramCode(
    telegramCode: string,
  ): Promise<BlogSubscriber | null> {
    try {
      return await this.blogSubscribersRepository
        .createQueryBuilder('bs')
        .where(`bs.telegramCode = :telegramCode`, {
          telegramCode: telegramCode,
        })
        .getOne();
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async findSubscribersForTelegramNotification(
    blogId: string,
  ): Promise<BlogSubscriber[] | null> {
    try {
      return await this.blogSubscribersRepository
        .createQueryBuilder('bs')
        .select('bs.telegramId')
        .where(`bs.blogId = :blogId`, {
          blogId: blogId,
        })
        .andWhere(`bs.subscriptionStatus = 'Subscribed'`)
        .andWhere(`bs.telegramId is not null`)
        .getMany();
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async checkTelegramId(telegramId: number): Promise<BlogSubscriber | null> {
    try {
      return await this.blogSubscribersRepository
        .createQueryBuilder('bs')
        .where(`bs.telegramId = :telegramId`, {
          telegramId: telegramId,
        })
        .getOne();
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async findSubscribersForTelegramMock(): Promise<BlogSubscriber[] | null> {
    try {
      return await this.blogSubscribersRepository
        .createQueryBuilder('bs')
        .getMany();
    } catch (e) {
      console.error(e);
      return null;
    }
  }
}
