import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule } from '@nestjs/config';
import {
  Company,
  DatabaseModule,
  PasswordResetToken,
  Plan,
  PlanFeature,
  Role,
  Subscription,
  User,
} from '@app/common/database';
import { JwtModule } from '@nestjs/jwt';
import { LoginUseCase } from './useCase/login.useCase';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtStrategy } from './strategy/jwt.strategy';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guard/auth.guard';
import { RolesGuard } from './guard/roles.guard';
import {
  CanResetPasswordUseCase,
  HandleResetPasswordUseCase,
  RegisterUseCase,
  ResetPasswordUseCase,
} from './useCase';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/auth/.env.dev',
    }),
    DatabaseModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '60m' },
    }),
    TypeOrmModule.forFeature([
      User,
      Role,
      Company,
      PasswordResetToken,
      Plan,
      Subscription,
      PlanFeature,
    ]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    RegisterUseCase,
    LoginUseCase,
    ResetPasswordUseCase,
    CanResetPasswordUseCase,
    HandleResetPasswordUseCase,
    JwtStrategy,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AuthModule {}