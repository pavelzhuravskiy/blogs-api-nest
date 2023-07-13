import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionInputDto } from '../../../../dto/quiz/input/question.Input.dto';
import { Question } from '../../../../entities/quiz/question.entity';
import { DataSourceRepository } from '../../../../infrastructure/repositories/common/data-source.repository';

export class QuestionCreateCommand {
  constructor(public questionInputDto: QuestionInputDto) {}
}

@CommandHandler(QuestionCreateCommand)
export class QuestionCreateUseCase
  implements ICommandHandler<QuestionCreateCommand>
{
  constructor(private readonly dataSourceRepository: DataSourceRepository) {}

  async execute(command: QuestionCreateCommand): Promise<number> {
    const question = new Question();
    question.body = command.questionInputDto.body;
    question.correctAnswers = command.questionInputDto.correctAnswers;
    question.published = false;
    question.createdAt = new Date();

    const savedQuestion = await this.dataSourceRepository.save(question);
    return savedQuestion.id;
  }
}
