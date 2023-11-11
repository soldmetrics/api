import { NestFactory } from '@nestjs/core';
import { SalesImportModule } from './sales-import.module';
import { ConfigService } from '@nestjs/config';
import { RmqService } from '@app/common/rabbitmq/rabbitmq.service';

async function bootstrap() {
  const app = await NestFactory.create(SalesImportModule);
  const configService = app.get(ConfigService);

  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice(rmqService.getOptions('BILLING'));

  await app.listen(configService.get('PORT'));
  await app.startAllMicroservices();
}
bootstrap();
