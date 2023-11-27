import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

export enum DeviceType {
  MOBILE = 'MOBILE',
  WEBBROWSER = 'WEBBROWSER',
}

@Entity()
export class Device {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  model: string;

  @Column()
  type: DeviceType;

  @Column({ nullable: true })
  pushToken: string;

  @Column({ nullable: true })
  platform: string;

  @ManyToOne(() => User, (user) => user.devices, {
    cascade: ['insert', 'remove'],
  })
  user: User;
}
