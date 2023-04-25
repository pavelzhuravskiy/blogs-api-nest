import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from './schemas/user.entity';
import { UsersRepository } from './users.repository';
import { UserCreateDto } from './dto/user.create.dto';
import { UserViewModel } from './schemas/user.view';
import bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
    private readonly usersRepository: UsersRepository,
  ) {}

  async createUser(createUserDto: UserCreateDto): Promise<UserViewModel> {
    const hash = await bcrypt.hash(createUserDto.password, 10);
    const user = this.UserModel.createUser(createUserDto, this.UserModel, hash);
    return this.usersRepository.createUser(user);
  }

  async deleteUser(id: string): Promise<boolean> {
    const user = await this.usersRepository.findUser(id);

    if (!user) {
      throw new InternalServerErrorException(
        `Something went wrong during user find operation`,
      );
    }

    return this.usersRepository.deleteUser(id);
  }
}
