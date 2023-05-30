import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserInputDto } from '../../dto/users/user-input.dto';
import { UsersQueryRepository } from '../../infrastructure/users/users.query.repository';
import { BasicAuthGuard } from '../../../auth/guards/basic-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { UserCreateCommand } from './application/use-cases/user-create.use-case';
import { UserQueryDto } from '../../dto/users/user-query.dto';
import { UserDeleteCommand } from './application/use-cases/user-delete.use-case';
import { exceptionHandler } from '../../../exceptions/exception.handler';
import { ResultCode } from '../../../enums/result-code.enum';
import {
  userIDField,
  userNotFound,
} from '../../../exceptions/exception.constants';
import { SAUserBanInputDto } from '../../dto/users/sa.user-ban.input.dto';
import { SAUserBanCommand } from './application/use-cases/user-ban.use-case';

@Controller('sa/users')
export class SuperAdminUsersController {
  constructor(
    private commandBus: CommandBus,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  @UseGuards(BasicAuthGuard)
  @Post()
  async createUser(@Body() userInputDto: UserInputDto) {
    const userId = await this.commandBus.execute(
      new UserCreateCommand(userInputDto),
    );

    return this.usersQueryRepository.findUser(userId);
  }

  @UseGuards(BasicAuthGuard)
  @Get()
  async findUsers(@Query() query: UserQueryDto) {
    return this.usersQueryRepository.findUsers(query);
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  async deleteUser(@Param('id') userId) {
    const result = await this.commandBus.execute(new UserDeleteCommand(userId));

    if (!result) {
      return exceptionHandler(ResultCode.NotFound, userNotFound, userIDField);
    }

    return result;
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id/ban')
  @HttpCode(204)
  async banUser(
    @Body() saUserBanInputDto: SAUserBanInputDto,
    @Param('id') userId,
  ) {
    const result = await this.commandBus.execute(
      new SAUserBanCommand(saUserBanInputDto, userId),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }
}
