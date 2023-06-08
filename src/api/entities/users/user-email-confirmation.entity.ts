import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserEmailConfirmation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  userId: number; // FK 🔑

  @Column({ type: 'uuid' })
  confirmationCode: string;

  @Column({ type: 'timestamp with time zone' })
  expirationDate: Date;
}
