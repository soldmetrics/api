import { NestFactory } from '@nestjs/core';
import { IntegrationsModule } from './integrations.module';
import { RmqService } from '@app/common/rabbitmq/rabbitmq.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(IntegrationsModule);

  const config = new DocumentBuilder()
    .setTitle('Documentação Auth - Sold Metrics')
    .setDescription('Descrição')
    .setVersion('1.0')
    .addTag('Sales Import')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice(rmqService.getOptions('INTEGRATIONS'));

  await app.listen(3002);
  await app.startAllMicroservices();
}
bootstrap();
