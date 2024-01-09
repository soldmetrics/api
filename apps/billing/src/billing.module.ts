import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
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
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillingUseCase } from './useCase';
import { HttpModule } from '@nestjs/axios';
import { RmqModule } from '@app/common/rabbitmq/rabbitmq.module';
import { SALES_IMPORT_SERVICE } from '@app/common/config/constants';
import { JwtAuthGuard } from 'apps/auth/src/guard/auth.guard';
import { RolesGuard } from 'apps/auth/src/guard/roles.guard';
import { APP_GUARD } from '@nestjs/core';
import { JwtStrategy } from 'apps/auth/src/strategy/jwt.strategy';
import { Sale } from '@app/common/database/model/entity/sale.entity';
import { Product } from '@app/common/database/model/entity/product.entity';
import { ProductSale } from '@app/common/database/model/entity/productSale.entity';
import { ProductCostChange } from '@app/common/database/model/entity/productCostChange.entity';
import { GetUserAndCompanyUseCase } from '@app/common/utils/getUserCompany.useCase';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/billing/.env.dev',
    }),
    DatabaseModule,
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
    ]),
    HttpModule,
    RmqModule.register({
      name: SALES_IMPORT_SERVICE,
    }),
  ],
  controllers: [BillingController],
  providers: [
    BillingService,
    BillingUseCase,
    JwtStrategy,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    GetUserAndCompanyUseCase,
  ],
})
export class BillingModule {}
