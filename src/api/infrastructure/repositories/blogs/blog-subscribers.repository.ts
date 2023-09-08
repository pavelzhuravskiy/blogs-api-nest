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

  async findBlogSubscriber(
    blogId: string,
    userId: string,
  ): Promise<BlogSubscriber | null> {
    try {
      return await this.blogSubscribersRepository
        .createQueryBuilder('bs')
        .where(`bs.userId = :userId`, { userId: userId })
        .andWhere('bs.blogId = :blogId', { blogId: blogId })
        .getOne();
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  // ***** Delete blog subscribers operations *****
  async deleteBlogSubscriber(subscriberId: string): Promise<boolean> {
    const result = await this.blogSubscribersRepository
      .createQueryBuilder('bs')
      .delete()
      .from(BlogSubscriber)
      .where(`id = :subscriberId`, { subscriberId: subscriberId })
      .execute();
    return result.affected === 1;
  }
}
