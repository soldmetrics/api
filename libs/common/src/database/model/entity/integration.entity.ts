import { BlingRepository } from '@app/common/repository';
import { ExternalRepository } from '@app/common/repository/externalRepository.interface';
import { TinyRepository } from '@app/common/repository/tinyRepository';
import { HttpService } from '@nestjs/axios';
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

export enum IntegrationProvider {
  BLING = 'BLING',
  TINY = 'TINY',
  MERCADOLIVRE = 'MERCADOLIVRE',
}

export enum IntegrationStatus {
  PENDING_ACTIVATION = 'PENDING_ACTIVATION',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

@Entity()
export class Integration {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Company, (company) => company.integrations)
  @JoinColumn()
  company: Company;

  @Column({ type: 'enum', enum: IntegrationProvider })
  integrationProvider: IntegrationProvider;

  @Column({ nullable: true })
  accountName: string;

  @Column({ nullable: true })
  userCode: string;

  @Column({ nullable: true })
  token: string;

  @Column({ nullable: true })
  verificationState: string;

  @Column({
    type: 'enum',
    enum: IntegrationStatus,
    default: IntegrationStatus.PENDING_ACTIVATION,
  })
  status: IntegrationStatus;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  getExternalRepository(httpService: HttpService): ExternalRepository {
    switch (this.integrationProvider) {
      case IntegrationProvider.BLING:
        return new BlingRepository(httpService, this.token);
      case IntegrationProvider.TINY:
        return new TinyRepository(httpService, this.token);
      default:
        return new BlingRepository(httpService, this.token);
    }
  }
}
