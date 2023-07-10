import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizQuestionsRepository } from '../../../../infrastructure/repositories/quiz/quiz-questions.repository';
import { QuizQuestion } from '../../../../entities/quiz/question.entity';
import { QuestionPublishInputDto } from '../../../../dto/quiz/input/question-publish.Input.dto';

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
  constructor(private readonly questionsRepository: QuizQuestionsRepository) {}

  async execute(command: QuestionPublishCommand): Promise<QuizQuestion | null> {
    const question = await this.questionsRepository.findQuestion(
      command.questionId,
    );

    if (!question) {
      return null;
    }

    question.published = command.questionPublishInputDto.published;
    question.updatedAt = new Date();
    return this.questionsRepository.dataSourceSave(question);
  }
}
