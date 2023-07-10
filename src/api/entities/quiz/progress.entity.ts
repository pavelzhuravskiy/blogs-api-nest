import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { QuizGame } from './quiz-game.entity';
import { QuizAnswer } from './answer.entity';

@Entity('quiz_player_progresses')
export class QuizPlayerProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'score',
    type: 'int',
  })
  score: number;

  @ManyToOne(() => QuizGame, (game) => game.progresses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  game: QuizGame;

  @OneToMany(() => QuizAnswer, (answer) => answer.progress)
  answers: QuizAnswer[];

  @OneToOne(() => User, (user) => user.progress, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;
}
