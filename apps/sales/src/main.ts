import { NestFactory } from '@nestjs/core';
import { SalesModule } from './sales.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(SalesModule);
  const configService = app.get(ConfigService);

  const config = new DocumentBuilder()
    .setTitle('Documentação Sales - Sold Metrics')
    .setDescription('Descrição')
    .setVersion('1.0')
    .addTag('Sales')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(configService.get('PORT'));
}
bootstrap();
