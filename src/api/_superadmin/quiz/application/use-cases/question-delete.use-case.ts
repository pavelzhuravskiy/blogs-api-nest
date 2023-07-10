import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizQuestionsRepository } from '../../../../infrastructure/repositories/quiz/quiz-questions.repository';

export class QuestionDeleteCommand {
  constructor(public questionId: string) {}
}

@CommandHandler(QuestionDeleteCommand)
export class QuestionDeleteUseCase
  implements ICommandHandler<QuestionDeleteCommand>
{
  constructor(private readonly questionsRepository: QuizQuestionsRepository) {}

  async execute(command: QuestionDeleteCommand): Promise<boolean | null> {
    const question = await this.questionsRepository.findQuestion(
      command.questionId,
    );

    if (!question) {
      return null;
    }

    return this.questionsRepository.deleteQuestion(question.id);
  }
}
