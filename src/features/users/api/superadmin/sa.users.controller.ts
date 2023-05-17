import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserInputDto } from '../../dto/user-input.dto';
import { UsersQueryRepository } from './infrastructure/users.query.repository';
import { BasicAuthGuard } from '../../../auth/guards/basic-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { UserCreateCommand } from './application/use-cases/user-create.use-case';
import { UserQueryDto } from '../../dto/user-query.dto';
import { UserDeleteCommand } from './application/use-cases/user-delete.use-case';
import { exceptionHandler } from '../../../../exceptions/exception.handler';
import { ResultCode } from '../../../../exceptions/enum/exception-codes.enum';
import {
  userIDField,
  userNotFound,
} from '../../../../exceptions/exception.constants';

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
}
