import { Controller, Delete, HttpCode } from '@nestjs/common';
import { BlogsService } from '../blogs/blogs.service';
import { PostsService } from '../posts/posts.service';
import { CommentsService } from '../comments/comments.service';
import { UsersService } from '../users/users.service';

@Controller('testing')
export class TestingController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly postsService: PostsService,
    private readonly commentsService: CommentsService,
    private readonly usersService: UsersService,
  ) {}

  @Delete('/all-data')
  @HttpCode(204)
  async deleteAll() {
    await this.blogsService.deleteBlogs();
    await this.postsService.deletePosts();
    await this.commentsService.deleteComments();
    return this.usersService.deleteUsers();
  }
}
