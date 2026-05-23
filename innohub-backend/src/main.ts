import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { PrismaClientExceptionFilter } from './common/filters/prisma-client-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api');

  // Strict Security Headers
  app.use(helmet());

  // Dynamic CORS setup
  const corsOrigin = configService.get<string>('CORS_ORIGIN');
  app.enableCors({
    origin: corsOrigin ? corsOrigin.split(',') : true,
    credentials: true,
  });

  // Strict Global Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global Exception Filters
  app.useGlobalFilters(new PrismaClientExceptionFilter());

  // Global Enterprise Swagger UI
  const config = new DocumentBuilder()
    .setTitle('Inno HUB API')
    .setDescription('Enterprise-grade LMS and Editorial API platform documentation.')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Public', 'Open access authentication endpoints')
    .addTag('LMS', 'Learning Management System modules')
    .addTag('Editorial', 'Scientific paper submission flows')
    .addTag('Admin-Auth', 'Administrative gatekeepers')
    .addTag('Admin-Panel', 'Internal configuration panels')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = configService.get<number>('PORT') || 3000;

  await app.listen(port, '0.0.0.0');

  console.log(`🚀 http://localhost:${port}`);
  console.log(`📖 Swagger: http://localhost:${port}/docs`);
}

bootstrap().catch((err) => {
  console.error('❌ Server failed to start:', err);
  process.exit(1);
});
