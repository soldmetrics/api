import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from './company.entity';
import { Plan } from './plan.entity';
import { IsNotEmpty } from 'class-validator';

export enum SubscriptionStatusEnum {
  PENDING_ACTIVATION = 'PENDING_ACTIVATION',
  ACTIVE = 'ACTIVE',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

@Entity()
export class Subscription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: true,
  })
  sessionId: string;

  @Column({
    nullable: true,
  })
  subscriptionId: string;

  @Column({
    nullable: true,
  })
  endTrial: Date;

  @ManyToOne(() => Company, (company) => company.subscriptions)
  @JoinColumn()
  company: Company;

  @ManyToOne(() => Plan, (plan) => plan.subscriptions)
  @JoinColumn()
  plan: Plan;

  @Column()
  @IsNotEmpty()
  startDate: Date;

  @Column({ nullable: true })
  endDate: Date;

  @Column({
    default: SubscriptionStatusEnum.PENDING_ACTIVATION,
    enum: SubscriptionStatusEnum,
    type: 'enum',
  })
  status: SubscriptionStatusEnum;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;
}
