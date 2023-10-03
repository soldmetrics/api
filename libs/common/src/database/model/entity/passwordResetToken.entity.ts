import * as moment from 'moment';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
@Unique(['token'])
export class PasswordResetToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  token: string;

  @ManyToOne(() => User, { cascade: false })
  @JoinColumn()
  user: User;

  @Column({ length: 6 })
  code: string;

  @Column({ default: 0 })
  attempts: number;

  @Column()
  expiryDate: Date;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  constructor(token: string, user: User, code: string) {
    this.token = token;
    this.user = user;
    this.expiryDate = moment().add(1, 'day').toDate();
    this.code = code;
  }
}
