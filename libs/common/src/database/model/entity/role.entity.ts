import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum RolesEnum {
  'ROLE_USER' = 'ROLE_USER',
  'ROLE_COMPANY_MANAGER' = 'ROLE_COMPANY_MANAGER',
  'ROLE_ADMIN' = 'ROLE_ADMIN',
}

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;
}
