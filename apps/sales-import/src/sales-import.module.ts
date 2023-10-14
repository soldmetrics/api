import { Module } from '@nestjs/common';
import { SalesImportController } from './sales-import.controller';
import { SalesImportService } from './sales-import.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Company,
  DatabaseModule,
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
import { ReceiveSalesUseCase } from './useCase/receiveSale.useCase';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/auth/.env.dev',
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
    ]),
    HttpModule,
    // BatchModule,
    // ScheduleModule.``forRoot(),
  ],
  controllers: [SalesImportController],
  providers: [SalesImportService, ReceiveSalesUseCase],
})
export class SalesImportModule {}
