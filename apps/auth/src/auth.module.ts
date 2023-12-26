import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule } from '@nestjs/config';
import {
  Company,
  DatabaseModule,
  Device,
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
import { Sale } from '@app/common/database/model/entity/sale.entity';
import { Product } from '@app/common/database/model/entity/product.entity';
import { ProductSale } from '@app/common/database/model/entity/productSale.entity';
import { ProductCostChange } from '@app/common/database/model/entity/productCostChange.entity';
import { GetUserAndCompanyUseCase } from '@app/common/utils/getUserCompany.useCase';
import { SetIntegrationUseCase } from './useCase/setIntegration.useCase';
import { HttpModule } from '@nestjs/axios';
import { RmqModule } from '@app/common/rabbitmq/rabbitmq.module';
import { INTEGRATIONS_SERVICE } from '@app/common/config/constants';
import { RegisterDeviceUseCase } from './useCase/registerDevice.useCase';
import { SendSalesPushNotificationUseCase } from './useCase/sendSalesPushNotification.useCase';
import { Integration } from '@app/common/database/model/entity/integration.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.dev',
    }),
    DatabaseModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '3d' },
    }),
    TypeOrmModule.forFeature([
      User,
      Role,
      Company,
      PasswordResetToken,
      Plan,
      Subscription,
      PlanFeature,
      Sale,
      Product,
      ProductSale,
      ProductCostChange,
      Device,
      Integration,
    ]),
    HttpModule,
    RmqModule,
    RmqModule.register({
      name: INTEGRATIONS_SERVICE,
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    RegisterUseCase,
    LoginUseCase,
    ResetPasswordUseCase,
    CanResetPasswordUseCase,
    HandleResetPasswordUseCase,
    GetUserAndCompanyUseCase,
    JwtStrategy,
    SetIntegrationUseCase,
    RegisterDeviceUseCase,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    SendSalesPushNotificationUseCase,
  ],
})
export class AuthModule {}
