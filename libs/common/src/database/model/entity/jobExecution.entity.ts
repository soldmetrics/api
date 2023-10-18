import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Company } from './company.entity';

export enum JobNameEnum {
  'IMPORT_BLING_SALES' = 'IMPORT_BLING_SALES',
  'IMPORT_BLING_INVOICES' = 'IMPORT_BLING_INVOICES',
}

@Entity()
export class JobExecution {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  jobName: string;

  @Column({ nullable: true })
  details: string;

  @Column({ nullable: true })
  lastPage: number;

  @ManyToOne(() => Company)
  company: Company;

  @Column()
  @CreateDateColumn()
  createdAt: Date;
}
