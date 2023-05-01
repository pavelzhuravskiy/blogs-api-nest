import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { UserCreateDto } from './dto/user-create.dto';
import { UsersService } from './users.service';
import { UserQuery } from './dto/user.query';
import { UsersQueryRepository } from './users.query.repository';
import { exceptionHandler } from '../exceptions/exception.handler';
import { ErrorCodes } from '../common/enums/error-codes.enum';
import { userIDField, userNotFound } from '../exceptions/exception.constants';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  @Post()
  async createUser(@Body() createUserDto: UserCreateDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Get()
  async findUsers(@Query() query: UserQuery) {
    return this.usersQueryRepository.findUsers(query);
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteUser(@Param('id') id: string) {
    const result = await this.usersService.deleteUser(id);

    if (!result) {
      return exceptionHandler(ErrorCodes.NotFound, userNotFound, userIDField);
    }

    return result;
  }

  @Delete()
  @HttpCode(204)
  async deleteUsers() {
    return this.usersService.deleteUsers();
  }
}
