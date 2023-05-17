import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../../infrastructure/users.repository';
import { UserBanInputDto } from '../../dto/user-ban.input.dto';
import { ResultCode } from '../../../../../../enum/result-code.enum';
import {
  userIDField,
  userIsBanned,
  userIsUnbanned,
  userNotFound,
} from '../../../../../../exceptions/exception.constants';
import { ExceptionResultType } from '../../../../../../exceptions/types/exception-result.type';

export class UserBanCommand {
  constructor(public userBanInputDto: UserBanInputDto, public userId: string) {}
}

@CommandHandler(UserBanCommand)
export class UserBanUseCase implements ICommandHandler<UserBanCommand> {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(
    command: UserBanCommand,
  ): Promise<ExceptionResultType<boolean>> {
    const user = await this.usersRepository.findUserById(command.userId);

    if (!user) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: userIDField,
        message: userNotFound,
      };
    }

    const banDBStatus = user.banInfo.isBanned;

    if (banDBStatus && command.userBanInputDto.isBanned) {
      return {
        data: false,
        code: ResultCode.BadRequest,
        field: userIDField,
        message: userIsBanned,
      };
    }

    if (!banDBStatus && !command.userBanInputDto.isBanned) {
      return {
        data: false,
        code: ResultCode.BadRequest,
        field: userIDField,
        message: userIsUnbanned,
      };
    }

    if (!banDBStatus) {
      user.banUser(command.userBanInputDto);
    } else {
      user.unbanUser();
    }

    console.log(user);

    await this.usersRepository.save(user);

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
