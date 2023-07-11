import { GameStatus } from '../../../../enums/game-status.enum';
import { Answer } from '../../../entities/quiz/answer.entity';

export class GameViewDto {
  id: string;
  firstPlayerProgress: {
    answers: Answer[] | [];
    player: PlayerViewDto;
    score: number;
  };
  secondPlayerProgress: {
    answers: Answer[] | [];
    player: PlayerViewDto;
    score: number;
  } | null;
  questions: QuestionViewDto[] | [];
  status: GameStatus;
  pairCreatedDate: Date;
  startGameDate: Date | null;
  finishGameDate: Date | null;
}

class PlayerViewDto {
  id: string;
  login: string;
}

class QuestionViewDto {
  id: string;
  body: string;
}
