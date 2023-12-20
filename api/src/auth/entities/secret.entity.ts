import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Secret {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  password?: string;

  @Column({ type: 'timestamp', nullable: true })
  lastSignedIn?: Date;

  @Column({ type: 'varchar', nullable: true })
  verificationToken?: string;

  @Column({ type: 'varchar', nullable: true })
  twoFactorSecret?: string;

  @Column({ type: 'text', nullable: true, array: true })
  twoFactorBackupCodes?: string[];

  @Column({ type: 'varchar', nullable: true })
  refreshToken?: string;

  @Column({ type: 'varchar', nullable: true })
  resetToken?: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.secrets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
