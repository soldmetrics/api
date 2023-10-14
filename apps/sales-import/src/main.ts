import { NestFactory } from '@nestjs/core';
import { SalesImportModule } from './sales-import.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(SalesImportModule);
  const configService = app.get(ConfigService);

  await app.listen(configService.get('PORT'));
}
bootstrap();
