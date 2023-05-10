import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserModelType } from './schemas/user.entity';
import { UsersRepository } from './users.repository';
import { UserCreateDto } from './dto/user-create.dto';
import bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
    private readonly usersRepository: UsersRepository,
  ) {}

  async createUser(createUserDto: UserCreateDto): Promise<UserDocument | null> {
    const hash = await bcrypt.hash(
      createUserDto.password,
      Number(process.env.HASH_ROUNDS),
    );
    const user = this.UserModel.createUser(createUserDto, this.UserModel, hash);
    return this.usersRepository.save(user);
  }

  async deleteUser(id: string): Promise<boolean | null> {
    const user = await this.usersRepository.findUserById(id);

    if (!user) {
      return null;
    }

    return this.usersRepository.deleteUser(id);
  }
}
