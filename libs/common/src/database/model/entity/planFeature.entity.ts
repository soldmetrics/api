import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Plan } from './plan.entity';
import { IsNotEmpty } from 'class-validator';

@Entity()
@Unique('feature', ['plan', 'resource'])
export class PlanFeature {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Plan, (plan) => plan.subscriptions)
  @JoinColumn()
  plan: Plan;

  @Column()
  @IsNotEmpty()
  description: string;

  @Column()
  @IsNotEmpty()
  resource: string;

  @Column({ default: 1 })
  resourceQuantity: number;

  @Column({ default: true })
  enabled: boolean;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;
}
