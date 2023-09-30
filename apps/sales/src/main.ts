import { NestFactory } from '@nestjs/core';
import { SalesModule } from './sales.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(SalesModule);
  const configService = app.get(ConfigService);

  await app.listen(configService.get('PORT'));
}
bootstrap();
