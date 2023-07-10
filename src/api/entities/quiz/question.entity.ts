import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { QuizGame } from './quiz-game.entity';

@Entity('quiz_questions')
export class QuizQuestion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', width: 500 })
  body: string;

  @Column({ name: 'correct_answers', type: 'jsonb', default: [] })
  correctAnswers;

  @Column({ type: 'boolean', default: false })
  published: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @Column({
    name: 'updated_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  updatedAt: Date;

  @ManyToMany(() => QuizGame, (game) => game.questions)
  @JoinTable()
  games: QuizGame[];

  static checkSortingField(value: any) {
    const q = new QuizQuestion();
    q.id = 1;
    q.body = '';
    q.published = false;
    q.createdAt = new Date();
    q.updatedAt = new Date();
    return q.hasOwnProperty(value);
  }
}
