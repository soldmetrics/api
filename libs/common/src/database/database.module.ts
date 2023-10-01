import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Company,
  PasswordResetToken,
  Role,
  User,
  Plan,
  PlanFeature,
  Subscription,
} from './model/entity';

const sslDefaultConfig = {
  rejectUnauthorized: false,
};

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.USERNAME,
      password: process.env.PASSWORD,
      database: process.env.DATABASE,
      synchronize: true,
      // synchronize: process.env.NODE_ENV === 'dev',
      autoLoadEntities: true,
      keepConnectionAlive: true,
      ssl: process.env.NODE_ENV === 'prod' ? sslDefaultConfig : false,
    }),
    TypeOrmModule.forFeature([
      User,
      Role,
      Company,
      PasswordResetToken,
      PlanFeature,
      Plan,
      Subscription,
    ]),
  ],
})
export class DatabaseModule {}
