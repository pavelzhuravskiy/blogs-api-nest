import { InjectModel } from '@nestjs/mongoose';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users.repository';
import bcrypt from 'bcrypt';
import { UserInputDto } from '../../dto/user-input.dto';
import { User, UserModelType } from '../../user.entity';

export class UserCreateCommand {
  constructor(public userInputDto: UserInputDto) {}
}

@CommandHandler(UserCreateCommand)
export class UserCreateUseCase implements ICommandHandler<UserCreateCommand> {
  constructor(
    @InjectModel(User.name)
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
