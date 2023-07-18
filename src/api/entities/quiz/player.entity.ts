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
import { Game } from './game.entity';
import { Answer } from './answer.entity';

@Entity('quiz_players')
export class Player {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'score',
    type: 'int',
  })
  score: number;

  @OneToOne(() => Game)
  game: Game;

  @OneToMany(() => Answer, (answer) => answer.player)
  answers: Answer[];

  @ManyToOne(() => User, (user) => user.player, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;
}
