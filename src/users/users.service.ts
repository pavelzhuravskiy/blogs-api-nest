import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from './schemas/user.entity';
import { UsersRepository } from './users.repository';
import { UserCreateDto } from './dto/user-create.dto';
import { UserViewModel } from './schemas/user.view';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { MailService } from '../mail/mail.service';
import { add } from 'date-fns';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
    private usersRepository: UsersRepository,
    private mailService: MailService,
  ) {}

  async registerUser(
    createUserDto: UserCreateDto,
  ): Promise<UserViewModel | null> {
    const hash = await bcrypt.hash(
      createUserDto.password,
      Number(process.env.HASH_ROUNDS),
    );
    const emailData = {
      confirmationCode: randomUUID(),
      expirationDate: add(new Date(), { hours: 1 }),
      isConfirmed: false,
    };
    const user = this.UserModel.createUser(
      createUserDto,
      this.UserModel,
      hash,
      emailData,
    );

    const result = await this.usersRepository.createUser(user);

    try {
      await this.mailService.sendRegistrationMail(
        createUserDto,
        emailData.confirmationCode,
      );
    } catch (error) {
      console.error(error);
      await this.usersRepository.deleteUser(user.id);
      return null;
    }

    return result;
  }

  async createUser(
    createUserDto: UserCreateDto,
  ): Promise<UserViewModel | null> {
    const hash = await bcrypt.hash(
      createUserDto.password,
      Number(process.env.HASH_ROUNDS),
    );
    const user = this.UserModel.createUser(createUserDto, this.UserModel, hash);
    return this.usersRepository.createUser(user);
  }

  async deleteUser(id: string): Promise<boolean | null> {
    const user = await this.usersRepository.findUserById(id);

    if (!user) {
      return null;
    }

    return this.usersRepository.deleteUser(id);
  }
}
