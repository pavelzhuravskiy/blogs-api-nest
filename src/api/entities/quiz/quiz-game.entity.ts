import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { QuizPlayerProgress } from './progress.entity';
import { QuizQuestion } from './question.entity';
import { GameStatus } from '../../../enums/game-status.enum';

@Entity('quiz_games')
export class QuizGame {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  status: GameStatus;

  @CreateDateColumn({
    name: 'pair_created_date',
    type: 'timestamp with time zone',
  })
  pairCreatedDate: Date;

  @Column({
    name: 'start_game_date',
    type: 'timestamp with time zone',
    nullable: true,
  })
  startGameDate: Date;

  @Column({
    name: 'finish_game_date',
    type: 'timestamp with time zone',
    nullable: true,
  })
  finishGameDate: Date;

  @OneToMany(() => QuizPlayerProgress, (progress) => progress.game)
  progresses: QuizPlayerProgress[];

  @ManyToMany(() => QuizQuestion, (question) => question.games)
  questions: QuizQuestion[];
}
