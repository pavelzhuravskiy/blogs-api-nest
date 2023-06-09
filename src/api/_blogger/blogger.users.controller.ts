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
import { exceptionHandler } from '../../exceptions/exception.handler';
import { ResultCode } from '../../enums/result-code.enum';
import { JwtBearerGuard } from '../_auth/guards/jwt-bearer.guard';
import { BloggerUserBanInputDto } from '../dto/users/input/blogger/blogger.user-ban.input.dto';
import { BloggerUserBanCommand } from './application/use-cases/user-ban.use-case';
import { UserIdFromGuard } from '../_auth/decorators/user-id-from-guard.decorator';
import { UsersQueryRepository } from '../infrastructure/users/users.query.repository';
import { BloggerUserBanQueryDto } from '../dto/users/query/blogger/blogger.user-ban.query.dto';
import {
  blogIDField,
  blogNotFound,
} from '../../exceptions/exception.constants';

@Controller('blogger/users')
export class BloggerUsersController {
  constructor(
    private commandBus: CommandBus,
    private readonly usersQueryRepository: UsersQueryRepository,
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

  @UseGuards(JwtBearerGuard)
  @Get('blog/:id')
  async findUsers(@Query() query: BloggerUserBanQueryDto, @Param('id') blogId) {
    const result = await this.usersQueryRepository.findUsersBannedByBlogger(
      query,
      blogId,
    );

    if (!result) {
      return exceptionHandler(ResultCode.NotFound, blogNotFound, blogIDField);
    }

    return result;
  }
}
