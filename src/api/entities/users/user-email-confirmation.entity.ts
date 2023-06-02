import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserEmailConfirmation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', nullable: true })
  confirmationCode: string | null;

  @Column({ type: 'timestamp', nullable: true })
  expirationDate: Date | null;

  @Column({ type: 'uuid' })
  userId: string;
}
