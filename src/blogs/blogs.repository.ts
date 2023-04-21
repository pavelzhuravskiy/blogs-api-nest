import { Injectable } from '@nestjs/common';
import { BlogDocument } from './schemas/blog.schema';

@Injectable()
export class BlogsRepository {
  async save(blog: BlogDocument) {
    return blog.save();
  }
}
