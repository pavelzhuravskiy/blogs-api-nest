import { InjectModel } from '@nestjs/mongoose';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../../infrastructure/users/users.repository';
import bcrypt from 'bcrypt';
import { UserInputDto } from '../../../../dto/users/input/user-input.dto';
import {
  UserMongoose,
  UserModelType,
} from '../../../../entities/_mongoose/user.entity';

export class UserCreateCommand {
  constructor(public userInputDto: UserInputDto) {}
}

@CommandHandler(UserCreateCommand)
export class UserCreateUseCase implements ICommandHandler<UserCreateCommand> {
  constructor(
    @InjectModel(UserMongoose.name)
    private UserModel: UserModelType,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(command: UserCreateCommand): Promise<string | null> {
    const hash = await bcrypt.hash(
      command.userInputDto.password,
      Number(process.env.HASH_ROUNDS),
    );
    const user = this.UserModel.createUser(
      this.UserModel,
      command.userInputDto,
      hash,
    );
    await this.usersRepository.save(user);
    return user.id;
  }
}
