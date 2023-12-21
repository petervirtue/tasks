import { Exclude } from 'class-transformer';
import { Secret } from 'src/auth/entities/secret.entity';
import { Provider } from 'src/auth/enums/provider.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
@Unique(['username'])
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', nullable: true })
  picture?: string;

  @Column()
  username: string;

  @Column()
  email: string;

  @Column({ default: 'en-US' })
  locale: string;

  @Column({ type: 'boolean', default: false })
  emailVerified: boolean;

  @Column({ type: 'boolean', default: false })
  twoFactorEnabled: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'enum', enum: Provider })
  provider: string;

  @Exclude()
  @OneToOne(() => Secret, (secret) => secret.user, { cascade: true })
  secret: Secret;
}
