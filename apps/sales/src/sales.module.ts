import { Module } from '@nestjs/common';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/sales/.env.dev',
    }),
  ],
  controllers: [SalesController],
  providers: [SalesService],
})
export class SalesModule {}
