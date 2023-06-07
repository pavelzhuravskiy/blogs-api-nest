import {
  Body,
  Controller,
  HttpCode,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { exceptionHandler } from '../../exceptions/exception.handler';
import { ResultCode } from '../../enums/result-code.enum';
import { JwtBearerGuard } from '../_auth/guards/jwt-bearer.guard';
import { BloggerUserBanInputDto } from '../dto/users/input/blogger/blogger.user-ban.input.dto';
import { BloggerUserBanCommand } from './application/use-cases/user-ban.use-case';
import { BlogsMongooseQueryRepository } from '../infrastructure/_mongoose/blogs/blogs.query.repository';
import { UsersMongooseQueryRepository } from '../infrastructure/_mongoose/users/users.mongoose.query.repository';
import { UserIdFromGuard } from '../_auth/decorators/user-id-from-guard.decorator';

@Controller('blogger/users')
export class BloggerUsersController {
  constructor(
    private commandBus: CommandBus,
    private readonly blogsQueryRepository: BlogsMongooseQueryRepository,
    private readonly usersQueryRepository: UsersMongooseQueryRepository,
  ) {}

  @UseGuards(JwtBearerGuard)
  @Put(':id/ban')
  @HttpCode(204)
  async banUser(
    @Body() bloggerUserBanInputDto: BloggerUserBanInputDto,
    @Param('id') userToBanId,
    @UserIdFromGuard() userId,
  ) {
    const result = await this.commandBus.execute(
      new BloggerUserBanCommand(bloggerUserBanInputDto, userToBanId, userId),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }

  /*@UseGuards(JwtBearerGuard)
  @Get('blog/:id')
  async findUsers(
    @Query() query: BloggerUserBanQueryDto,
    @Param('id') blogId,
    @UserIdFromGuard() userId,
  ) {
    const result = await this.usersQueryRepository.findUsersBannedByBlogger(
      query,
      blogId,
      userId,
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result.response;
  }*/
}
