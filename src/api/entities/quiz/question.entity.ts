import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', width: 500 })
  body: string;

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

  static checkSortingField(value: any) {
    const q = new Question();
    q.id = 1;
    q.body = '';
    q.published = false;
    q.createdAt = new Date();
    q.updatedAt = new Date();
    return q.hasOwnProperty(value);
  }
}
