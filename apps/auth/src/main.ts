declare const module: any;

import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
// import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
config({ path: `../.env.dev` });

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);
  // const configService = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();

  await app.startAllMicroservices();
  await app.listen(process.env.PORT);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
