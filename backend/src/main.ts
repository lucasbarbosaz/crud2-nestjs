import { BadRequestException, ClassSerializerInterceptor, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Reflector } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.getHttpAdapter().getInstance().set('etag', false);
  app.enableCors();
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      validationError: { target: false, value: false },
      exceptionFactory: (errors) => {
        const messages = errors.flatMap((error) => {
          if (!error.constraints) return [];
          return Object.values(error.constraints).map((msg) =>
            msg
              .replace('must not be less than', 'deve ser maior ou igual a')
              .replace('must be a number conforming to the specified constraints', 'deve ser um número válido')
              .replace('must be an integer number', 'deve ser um número inteiro')
              .replace('should not be empty', 'não pode estar vazio')
              .replace('must be an email', 'deve ser um e-mail válido')
              .replace('must be longer than or equal to', 'deve ter tamanho mínimo de')
              .replace('must be shorter than or equal to', 'deve ter tamanho máximo de'),
          );
        });
        return new BadRequestException(messages.length > 0 ? messages.join('; ') : 'Dados inválidos');
      },
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalFilters(new HttpExceptionFilter());

  const uploadsPath = join(process.cwd(), 'uploads');

  //caso nao exista a pasta de uploads (provavelmente)
  if (!existsSync(uploadsPath)) {
    mkdirSync(uploadsPath, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsPath));

  const config = new DocumentBuilder()
    .setTitle('Excellent API')
    .setDescription('CRUD de clientes, produtos e pedidos')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
