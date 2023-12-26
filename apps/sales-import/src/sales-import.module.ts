import { Module } from '@nestjs/common';
import { SalesImportController } from './sales-import.controller';
import { SalesImportService } from './sales-import.service';
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
import { ReceiveSalesUseCase } from './useCase/receiveSale.useCase';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { CleanSalesProcessor } from './batch/processors/cleanSalesProcessor';
import { ImportBlingSalesProcessor } from './batch/processors/importBlingSalesProcessor';
import { BlingJob } from './batch/blingJob';
import { JobExecution } from '@app/common/database/model/entity/jobExecution.entity';
import { ImportBlingInvoicesProcessor } from './batch/processors/importInvoicesProcessor';
import { RmqModule } from '@app/common/rabbitmq/rabbitmq.module';
import { JwtStrategy } from 'apps/auth/src/strategy/jwt.strategy';
import { ImportLastMonthUseCase } from './useCase/importLastMonth.useCase';
import { AUTH_SERVICE } from '@app/common/config/constants';
import { GenerateMercadolivreAuthUrlUseCase } from './useCase/generateMercadolivreAuthURL.useCase';
import { SetMercadolivreIntegrationUseCase } from './useCase/setMercadolivreIntegration.useCase';
import { Integration } from '@app/common/database/model/entity/integration.entity';
import { GetUserAndCompanyUseCase } from '@app/common/utils/getUserCompany.useCase';
import { JwtAuthGuard } from 'apps/auth/src/guard/auth.guard';
import { RolesGuard } from 'apps/auth/src/guard/roles.guard';
import { APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.dev',
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
      Integration,
    ]),
    HttpModule,
    ScheduleModule.forRoot(),
    RmqModule,
    RmqModule.register({
      name: AUTH_SERVICE,
    }),
    ServeStaticModule.forRoot({
      // rootPath: join(__dirname, 'apps/sales-import/static'),
      // serveRoot: 'mercadolivre/redirect',
    }),
  ],
  controllers: [SalesImportController],
  providers: [
    BlingJob,
    SalesImportService,
    ReceiveSalesUseCase,
    CleanSalesProcessor,
    ImportBlingSalesProcessor,
    ImportBlingInvoicesProcessor,
    ImportLastMonthUseCase,
    JwtStrategy,
    GenerateMercadolivreAuthUrlUseCase,
    SetMercadolivreIntegrationUseCase,
    GetUserAndCompanyUseCase,
    JwtStrategy,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class SalesImportModule {}
