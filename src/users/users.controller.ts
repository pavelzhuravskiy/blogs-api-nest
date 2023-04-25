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
import { UserCreateDto } from './dto/user.create.dto';
import { UsersService } from './users.service';
import { UserQuery } from './dto/user.query';
import { UsersQueryRepository } from './users.query.repository';

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
    return this.usersService.deleteUser(id);
  }

  @Delete()
  @HttpCode(204)
  async deleteUsers() {
    return this.usersService.deleteUsers();
  }
}
