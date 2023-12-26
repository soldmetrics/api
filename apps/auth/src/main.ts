declare const module: any;

import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
// import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { RmqService } from '@app/common/rabbitmq/rabbitmq.service';
config({ path: `.env.dev` });

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);
  // const configService = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Documentação Auth - Sold Metrics')
    .setDescription('Descrição')
    .setVersion('1.0')
    .addTag('Auth')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice(rmqService.getOptions('AUTH'));

  await app.listen(3001);
  await app.startAllMicroservices();

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
