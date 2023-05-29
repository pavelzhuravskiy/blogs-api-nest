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
import { JwtBearerGuard } from '../../auth/guards/jwt-bearer.guard';
import { BloggerUserBanInputDto } from './dto/user-ban.input.dto';
import { BloggerUserBanCommand } from './application/use-cases/user-ban.use-case';

@Controller('blogger/users')
export class BloggerUsersController {
  constructor(private commandBus: CommandBus) {}

  @UseGuards(JwtBearerGuard)
  @Put(':id/ban')
  @HttpCode(204)
  async banUser(
    @Body() bloggerUserBanInputDto: BloggerUserBanInputDto,
    @Param('id') userId,
  ) {
    const result = await this.commandBus.execute(
      new BloggerUserBanCommand(bloggerUserBanInputDto, userId),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }
}
