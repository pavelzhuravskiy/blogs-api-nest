import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserPasswordRecovery {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  userId: number; // FK 🔑

  @Column({ type: 'uuid' })
  recoveryCode: string;

  @Column({ type: 'timestamp with time zone' })
  expirationDate: Date;
}
