import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { BlogQueryDto } from '../../dto/blogs/query/blog.query.dto';
import { BasicAuthGuard } from '../../_auth/guards/basic-auth.guard';
import { ResultCode } from '../../../enums/result-code.enum';
import { exceptionHandler } from '../../../exceptions/exception.handler';
import { SABlogBanInputDto } from '../../dto/users/input/superadmin/sa.blog-ban.input.dto';
import { SABlogBanCommand } from './application/use-cases/blog-ban.use-case';
import { BlogsQueryRepository } from '../../infrastructure/repositories/blogs/blogs.query.repository';
import { blogNotFound } from '../../../exceptions/exception.constants';

@Controller('sa/blogs')
export class SuperAdminBlogsController {
  constructor(
    private commandBus: CommandBus,
    private readonly blogsQueryRepository: BlogsQueryRepository,
  ) {}

  @UseGuards(BasicAuthGuard)
  @Get()
  async findBlogs(@Query() query: BlogQueryDto) {
    return this.blogsQueryRepository.findBlogsForSA(query);
  }

  /*@UseGuards(BasicAuthGuard)
  @Put(':blogId/bind-with-user/:userId')
  @HttpCode(204)
  async bindBlog(@Param() params) {
    const result = await this.commandBus.execute(
      new BlogBindCommand(params.blogId, params.userId),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }*/

  @UseGuards(BasicAuthGuard)
  @Put(':id/ban')
  @HttpCode(204)
  async banBlog(
    @Body() saBlogBanInputDto: SABlogBanInputDto,
    @Param('id') blogId,
  ) {
    const result = await this.commandBus.execute(
      new SABlogBanCommand(saBlogBanInputDto, blogId),
    );

    if (!result) {
      return exceptionHandler(ResultCode.NotFound, blogNotFound, blogId);
    }

    return result;
  }
}
