import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Player } from './player.entity';
import { AnswerStatus } from '../../../enums/answer-status.enum';

@Entity('quiz_answers')
export class Answer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'answer_status', type: 'varchar' })
  answerStatus: AnswerStatus;

  @CreateDateColumn({ name: 'added_at', type: 'timestamp with time zone' })
  addedAt: Date;

  @ManyToOne(() => Player, (player) => player.answers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  player: Player;

  /*@ManyToOne(() => QuizQuestion, (question) => question.answer, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  question: QuizQuestion;*/

  @ManyToOne(() => User, (user) => user.answers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;
}
