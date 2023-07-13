import { Player } from '../api/entities/quiz/player.entity';
import { Answer } from '../api/entities/quiz/answer.entity';
import { Game } from '../api/entities/quiz/game.entity';

export type TypeORMEntity = Player | Answer | Game;
