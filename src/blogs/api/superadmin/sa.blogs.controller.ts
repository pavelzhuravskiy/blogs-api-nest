import { Controller, Get, Param, Put, Query, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { BlogsQueryRepository } from '../../infrastructure/blogs.query.repository';
import { BlogQueryDto } from '../../dto/blog.query.dto';
import { Role } from '../../../enum/roles.enum';
import { BasicAuthGuard } from '../../../auth/guards/basic-auth.guard';
import { ResultCode } from '../../../exceptions/exception-codes.enum';
import { exceptionHandler } from '../../../exceptions/exception.handler';
import { SuperAdminBindBlogCommand } from './application/use-cases/sa.bind-blog.use-case';

@Controller('sa/blogs')
export class SuperAdminBlogsController {
  constructor(
    private commandBus: CommandBus,
    private readonly blogsQueryRepository: BlogsQueryRepository,
  ) {}

  @UseGuards(BasicAuthGuard)
  @Get()
  async findBlogs(@Query() query: BlogQueryDto) {
    const role = Role.SuperAdmin;
    return this.blogsQueryRepository.findBlogs(query, role);
  }

  @UseGuards(BasicAuthGuard)
  @Put(':blogId/bind-with-user/:userId')
  async bindBlog(@Param() params) {
    const result = await this.commandBus.execute(
      new SuperAdminBindBlogCommand(params.blogId, params.userId),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }
}
