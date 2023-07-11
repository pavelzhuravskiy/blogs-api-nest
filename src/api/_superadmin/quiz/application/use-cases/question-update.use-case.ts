import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionInputDto } from '../../../../dto/quiz/input/question.Input.dto';
import { QuestionsRepository } from '../../../../infrastructure/repositories/quiz/questions.repository';
import { Question } from '../../../../entities/quiz/question.entity';

export class QuestionUpdateCommand {
  constructor(
    public questionInputDto: QuestionInputDto,
    public questionId: string,
  ) {}
}

@CommandHandler(QuestionUpdateCommand)
export class QuestionUpdateUseCase
  implements ICommandHandler<QuestionUpdateCommand>
{
  constructor(private readonly questionsRepository: QuestionsRepository) {}

  async execute(command: QuestionUpdateCommand): Promise<Question | null> {
    const question = await this.questionsRepository.findQuestion(
      command.questionId,
    );

    if (!question) {
      return null;
    }

    question.body = command.questionInputDto.body;
    question.correctAnswers = command.questionInputDto.correctAnswers;
    question.updatedAt = new Date();
    return this.questionsRepository.dataSourceSave(question);
  }
}
