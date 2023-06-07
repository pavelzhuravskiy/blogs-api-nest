import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class BlogBan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  blogId: number; // FK 🔑

  @Column({ type: 'timestamp with time zone', nullable: true })
  banDate: Date | null;
}
