import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  ClassSerializerInterceptor,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import 'reflect-metadata';
import { useContainer } from 'class-validator';
import { ConfigService } from '@nestjs/config';
import { StandardInterceptor } from './common/standard.interceptor';
import { Config } from './config/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  const configService = app.get(ConfigService<Config>);

  app.enableShutdownHooks();
  app.setGlobalPrefix(configService.getOrThrow('APP_API_PREFIX'), {
    exclude: ['/'],
  });
  app.enableVersioning({ type: VersioningType.URI });
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalInterceptors(new StandardInterceptor());

  await app.listen(configService.getOrThrow('APP_PORT'));
}
bootstrap();
