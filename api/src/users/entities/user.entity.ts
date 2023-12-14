import { Exclude, Expose } from 'class-transformer';
import { AuthProvidersEnum } from 'src/auth/auth-providers.enum';
import { Session } from 'src/sessions/entities/session.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude({ toPlainOnly: true })
  password: string;

  @Column({ default: AuthProvidersEnum.email })
  @Expose({ groups: ['me', 'admin'] })
  provider: string;

  @Index()
  @Column({ nullable: true })
  @Expose({ groups: ['me', 'admin'] })
  socialId: string | null;

  @Index()
  @Column({ nullable: true })
  firstName: string | null;

  @Index()
  @Column({ nullable: true })
  lastName: string | null;

  @OneToMany(() => Session, (session) => session.user)
  sessions: [Session];

  //   @ManyToOne(() => Role, {
  //     eager: true,
  //   })
  //   role?: Role | null;

  //   @ManyToOne(() => Status, {
  //     eager: true,
  //   })
  //   status?: Status;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
