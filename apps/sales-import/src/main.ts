import { NestFactory } from '@nestjs/core';
import { SalesImportModule } from './sales-import.module';
import { ConfigService } from '@nestjs/config';
import { RmqService } from '@app/common/rabbitmq/rabbitmq.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(SalesImportModule);
  const configService = app.get(ConfigService);

  const config = new DocumentBuilder()
    .setTitle('Documentação Auth - Sold Metrics')
    .setDescription('Descrição')
    .setVersion('1.0')
    .addTag('Sales Import')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice(rmqService.getOptions('SALES_IMPORT'));

  await app.listen(configService.get('PORT'));
  await app.startAllMicroservices();
}
bootstrap();
