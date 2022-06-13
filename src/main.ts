import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common/pipes';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

export let BASE_DUE_DATE_FACTOR;
export let DUE_DATE_FACTOR_1000;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  BASE_DUE_DATE_FACTOR = new Date(
    configService.getOrThrow('BASE_DUE_DATE_FACTOR'),
  );

  DUE_DATE_FACTOR_1000 = new Date(
    configService.getOrThrow('DUE_DATE_FACTOR_1000'),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('boleto-api')
    .setDescription('Desafio da ewally de validação de boletos')
    .setVersion(configService.get('API_VERSION_TAG'))
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(configService.get('API_PORT'));
}
bootstrap();
