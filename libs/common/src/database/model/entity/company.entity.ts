// import { HttpService } from '@nestjs/axios';
import { IsNotEmpty } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Subscription } from './subscription.entity';
import { Sale } from './sale.entity';
import { Product } from './product.entity';
import { Integration } from './integration.entity';

@Entity()
export class Company {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  name: string;

  @OneToMany(() => User, (user) => user.company)
  users: User[];

  @OneToMany(() => Subscription, (subscription) => subscription.company)
  subscriptions: Subscription[];

  @OneToMany(() => Integration, (integration) => integration.company)
  integrations: Integration[];

  @OneToMany(() => Sale, (sale) => sale.company)
  sales: Sale[];

  @OneToMany(() => Product, (product) => product.company)
  products: Product[];

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;
}
