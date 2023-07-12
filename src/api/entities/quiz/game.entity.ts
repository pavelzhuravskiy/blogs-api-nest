import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Player } from './player.entity';
import { Question } from './question.entity';
import { GameStatus } from '../../../enums/game-status.enum';

@Entity('quiz_games')
export class Game {
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

  @OneToMany(() => Player, (player) => player.game)
  players: Player[];

  @ManyToMany(() => Question, (question) => question.games)
  questions: Question[];
}
