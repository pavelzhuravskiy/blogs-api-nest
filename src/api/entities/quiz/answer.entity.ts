import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { QuizPlayerProgress } from './progress.entity';
import { AnswerStatus } from '../../../enums/answer-status.enum';

@Entity('quiz_answers')
export class QuizAnswer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'answer_status', type: 'varchar' })
  answerStatus: AnswerStatus;

  @CreateDateColumn({ name: 'added_at', type: 'timestamp with time zone' })
  addedAt: Date;

  @ManyToOne(() => QuizPlayerProgress, (progress) => progress.answers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  progress: QuizPlayerProgress;

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
