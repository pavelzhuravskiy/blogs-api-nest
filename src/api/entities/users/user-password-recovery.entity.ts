import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserPasswordRecovery {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', nullable: true })
  recoveryCode: string | null;

  @Column({ type: 'timestamp', nullable: true })
  expirationDate: Date | null;

  @Column({ type: 'integer' })
  userId: number; // FK 🔑
}
