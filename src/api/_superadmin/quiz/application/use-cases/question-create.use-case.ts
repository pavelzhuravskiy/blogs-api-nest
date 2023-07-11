import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionInputDto } from '../../../../dto/quiz/input/question.Input.dto';
import { QuestionsRepository } from '../../../../infrastructure/repositories/quiz/questions.repository';
import { Question } from '../../../../entities/quiz/question.entity';

export class QuestionCreateCommand {
  constructor(public questionInputDto: QuestionInputDto) {}
}

@CommandHandler(QuestionCreateCommand)
export class QuestionCreateUseCase
  implements ICommandHandler<QuestionCreateCommand>
{
  constructor(private readonly questionsRepository: QuestionsRepository) {}

  async execute(command: QuestionCreateCommand): Promise<number> {
    const question = new Question();
    question.body = command.questionInputDto.body;
    question.correctAnswers = command.questionInputDto.correctAnswers;
    question.published = false;
    question.createdAt = new Date();

    const savedQuestion = await this.questionsRepository.dataSourceSave(
      question,
    );
    return savedQuestion.id;
  }
}
