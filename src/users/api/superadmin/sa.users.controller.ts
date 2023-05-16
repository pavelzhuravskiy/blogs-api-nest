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
import { SuperAdminCreateUserCommand } from './application/use-cases/sa.create-user.use-case';
import { UserQueryDto } from '../../dto/user-query.dto';
import { SuperAdminDeleteUserCommand } from './application/use-cases/sa.delete-user.use-case';
import { exceptionHandler } from '../../../exceptions/exception.handler';
import { ResultCode } from '../../../exceptions/exception-codes.enum';
import {
  userIDField,
  userNotFound,
} from '../../../exceptions/exception.constants';

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
      new SuperAdminCreateUserCommand(userInputDto),
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
    const result = await this.commandBus.execute(
      new SuperAdminDeleteUserCommand(userId),
    );

    if (!result) {
      return exceptionHandler(ResultCode.NotFound, userNotFound, userIDField);
    }

    return result;
  }
}
