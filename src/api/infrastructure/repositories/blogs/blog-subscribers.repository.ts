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
}
