import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Player } from './player.entity';
import { AnswerStatus } from '../../../enums/answer-status.enum';
import { Question } from './question.entity';

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

  @ManyToOne(() => Question, (question) => question.answers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  question: Question;
}
