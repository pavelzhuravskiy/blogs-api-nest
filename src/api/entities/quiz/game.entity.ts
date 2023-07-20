import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Player } from './player.entity';
import { Question } from './question.entity';
import { GameStatus } from '../../../enums/game-status.enum';
import { randomUUID } from 'crypto';

@Entity('quiz_games')
export class Game {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @OneToOne(() => Player, (player) => player.game, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  playerOne: Player;

  @OneToOne(() => Player, (player) => player.game, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  playerTwo: Player;

  @ManyToMany(() => Question, (question) => question.games)
  questions: Question[];

  static checkSortingField(value: any) {
    const g = new Game();
    g.id = randomUUID();
    g.status = GameStatus.Finished;
    g.pairCreatedDate = new Date();
    g.startGameDate = new Date();
    g.finishGameDate = new Date();
    return g.hasOwnProperty(value);
  }
}
