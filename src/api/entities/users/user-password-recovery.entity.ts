import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserPasswordRecovery {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  userId: number; // FK 🔑

  @Column({ type: 'uuid', nullable: true })
  recoveryCode: string | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  expirationDate: Date | null;
}
