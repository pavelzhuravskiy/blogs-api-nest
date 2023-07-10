import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { QuizGame } from '../../../entities/quiz/quiz-game.entity';

@Injectable()
export class QuizGamesQueryRepository {
  constructor(
    @InjectRepository(QuizGame)
    private readonly quizGamesRepository: Repository<QuizGame>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async findGame(gameId: number): Promise<any> {
    const games = await this.quizGamesRepository
      .createQueryBuilder('game')
      .where(`game.id = :gameId`, {
        gameId: gameId,
      })
      // .leftJoinAndSelect('game.progresses', 'progress')
      // .leftJoinAndSelect('progress.user', 'u')
      // .leftJoinAndSelect('progress.answers', 'a')
      .leftJoinAndSelect('game.questions', 'q')
      .getMany();

    console.log(games);

    return games;
    // const mappedQuestions = await this.questionsMapping(questions);
    // return mappedQuestions[0];
  }

  /*private async gameMapping(
    array: QuizQuestion[],
  ): Promise<QuestionViewDto[]> {
    return array.map((q) => {
      return {
        id: q.id.toString(),
        body: q.body,
        correctAnswers: q.correctAnswers,
        published: q.published,
        createdAt: q.createdAt,
        updatedAt: q.updatedAt,
      };
    });
  }*/
}
