import { Module } from '@nestjs/common';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from 'apps/auth/src/strategy/jwt.strategy';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from 'apps/auth/src/guard/auth.guard';
import { RolesGuard } from 'apps/auth/src/guard/roles.guard';
import { GetUserAndCompanyUseCase } from '@app/common/utils/getUserCompany.useCase';
import { GetSalesUseCase } from './useCase/getSales.useCase';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Company,
  DatabaseModule,
  Device,
  PasswordResetToken,
  Plan,
  PlanFeature,
  Role,
  User,
} from '@app/common/database';
import { Subscription } from 'rxjs';
import { Sale } from '@app/common/database/model/entity/sale.entity';
import { Product } from '@app/common/database/model/entity/product.entity';
import { ProductSale } from '@app/common/database/model/entity/productSale.entity';
import { ProductCostChange } from '@app/common/database/model/entity/productCostChange.entity';
import { JobExecution } from '@app/common/database/model/entity/jobExecution.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/sales/.env.dev',
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
      JobExecution,
      Device,
    ]),
  ],
  controllers: [SalesController],
  providers: [
    SalesService,
    JwtStrategy,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    GetUserAndCompanyUseCase,
    GetSalesUseCase,
  ],
})
export class SalesModule {}
