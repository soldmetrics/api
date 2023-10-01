// import { HttpService } from '@nestjs/axios';
import { IsNotEmpty } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Subscription } from './subscription.entity';

export enum Integration {
  BLING = 'BLING',
  TINY = 'TINY',
}

@Entity()
@Unique('integration', ['integration', 'integrationKey'])
export class Company {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  name: string;

  @Column({ nullable: true })
  integrationKey: string;

  @Column({ type: 'enum', enum: Integration, default: Integration.BLING })
  integration: Integration;

  @OneToMany(() => User, (user) => user.company)
  users: User[];

  @OneToMany(() => Subscription, (subscription) => subscription.company)
  subscriptions: Subscription[];

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  // getExternalRepository(httpService: HttpService): ExternalRepository {
  //   switch (this.integration) {
  //     case Integration.BLING:
  //       return new BlingRepository(httpService, this.integrationKey);
  //     case Integration.TINY:
  //       return new TinyRepository(httpService, this.integrationKey);
  //     default:
  //       return new BlingRepository(httpService, this.integrationKey);
  //   }
  // }
}
