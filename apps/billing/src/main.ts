import { NestFactory } from '@nestjs/core';
import { BillingModule } from './billing.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(BillingModule, {
    rawBody: true,
  });
  const configService = app.get(ConfigService);

  const config = new DocumentBuilder()
    .setTitle('Documentação Billing - Sold Metrics')
    .setDescription('Descrição')
    .setVersion('1.0')
    .addTag('Billing')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(configService.get('PORT'));
}
bootstrap();
