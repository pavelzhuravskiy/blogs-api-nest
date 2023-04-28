import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from './schemas/user.entity';
import { UsersRepository } from './users.repository';
import { UserCreateDto } from './dto/user.create.dto';
import { UserViewModel } from './schemas/user.view';
import bcrypt from 'bcrypt';
import { UsersQueryRepository } from './users.query.repository';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
    private readonly usersRepository: UsersRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  async createUser(
    createUserDto: UserCreateDto,
  ): Promise<UserViewModel | null> {
    const hash = await bcrypt.hash(createUserDto.password, 10);
    const user = this.UserModel.createUser(createUserDto, this.UserModel, hash);
    await this.usersRepository.save(user);
    return this.usersQueryRepository.findUser(user.id);
  }

  async deleteUser(id: string): Promise<boolean | null> {
    const user = await this.usersRepository.findUser(id);

    if (!user) {
      return null;
    }

    return this.usersRepository.deleteUser(id);
  }

  async deleteUsers(): Promise<boolean> {
    return this.usersRepository.deleteUsers();
  }
}
