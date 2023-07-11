import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ResultCode } from '../../../../../enums/result-code.enum';
import {
  userIDField,
  userNotFound,
} from '../../../../../exceptions/exception.constants';
import { ExceptionResultType } from '../../../../../exceptions/types/exception-result.type';
import { UsersRepository } from '../../../../infrastructure/repositories/users/users.repository';
import { GamesRepository } from '../../../../infrastructure/repositories/quiz/games.repository';

export class AnswerSendCommand {
  constructor(public userId: number) {}
}

@CommandHandler(AnswerSendCommand)
export class AnswerSendUseCase implements ICommandHandler<AnswerSendCommand> {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly gamesRepository: GamesRepository,
  ) {}

  async execute(
    command: AnswerSendCommand,
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

    const currentGame = await this.gamesRepository.findGameOfCurrentUser(
      command.userId,
    );

    if (!currentGame) {
      return {
        data: false,
        code: ResultCode.Forbidden,
      };
    }

    console.log(currentGame);

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
