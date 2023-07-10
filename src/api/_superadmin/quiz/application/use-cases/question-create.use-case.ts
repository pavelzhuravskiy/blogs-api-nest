import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionInputDto } from '../../../../dto/quiz/input/question.Input.dto';
import { QuizQuestionsRepository } from '../../../../infrastructure/repositories/quiz/quiz-questions.repository';
import { QuizQuestion } from '../../../../entities/quiz/question.entity';

export class QuestionCreateCommand {
  constructor(public questionInputDto: QuestionInputDto) {}
}

@CommandHandler(QuestionCreateCommand)
export class QuestionCreateUseCase
  implements ICommandHandler<QuestionCreateCommand>
{
  constructor(private readonly questionsRepository: QuizQuestionsRepository) {}

  async execute(command: QuestionCreateCommand): Promise<number> {
    const question = new QuizQuestion();
    question.body = command.questionInputDto.body;
    question.published = false;
    question.createdAt = new Date();

    const savedQuestion = await this.questionsRepository.dataSourceSave(
      question,
    );
    return savedQuestion.id;
  }
}
