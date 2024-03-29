import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionsRepository } from '../../../../infrastructure/repositories/quiz/questions.repository';
import { Question } from '../../../../entities/quiz/question.entity';
import { QuestionPublishInputDto } from '../../../../dto/quiz/input/question-publish.Input.dto';
import { DataSourceRepository } from '../../../../infrastructure/repositories/common/data-source.repository';

export class QuestionPublishCommand {
  constructor(
    public questionPublishInputDto: QuestionPublishInputDto,
    public questionId: string,
  ) {}
}

@CommandHandler(QuestionPublishCommand)
export class QuestionPublishUseCase
  implements ICommandHandler<QuestionPublishCommand>
{
  constructor(
    private readonly questionsRepository: QuestionsRepository,
    private readonly dataSourceRepository: DataSourceRepository,
  ) {}

  async execute(command: QuestionPublishCommand): Promise<Question | null> {
    const question = await this.questionsRepository.findQuestion(
      command.questionId,
    );

    if (!question) {
      return null;
    }

    question.published = command.questionPublishInputDto.published;
    question.updatedAt = new Date();
    await this.dataSourceRepository.save(question);
    return question;
  }
}
