import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class BlogOwner {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  blogId: number; // FK 🔑

  @Column({ type: 'integer' })
  ownerId: number; // FK 🔑

  @Column({ type: 'varchar' })
  ownerLogin: string; // FK 🔑
}
