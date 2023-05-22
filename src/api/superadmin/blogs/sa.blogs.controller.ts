import { Controller, Get, Param, Put, Query, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { BlogsQueryRepository } from '../../public/blogs/infrastructure/blogs.query.repository';
import { BlogQueryDto } from '../../public/blogs/dto/blog.query.dto';
import { Role } from '../../../enums/role.enum';
import { BasicAuthGuard } from '../../../auth/guards/basic-auth.guard';
import { ResultCode } from '../../../enums/result-code.enum';
import { exceptionHandler } from '../../../exceptions/exception.handler';
import { BlogBindCommand } from './application/use-cases/blog-bind.use-case';

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
      new BlogBindCommand(params.blogId, params.userId),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }
}
