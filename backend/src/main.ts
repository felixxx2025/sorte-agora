import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import './tracing';

async function bootstrap() {
  if (process.env.NODE_ENV === 'production') {
    const jwt = process.env.JWT_SECRET || '';
    const enc = process.env.ENCRYPTION_KEY || '';
    const weak =
      !jwt ||
      jwt.length < 32 ||
      /change.?me|secret|default|your.?jwt/i.test(jwt) ||
      !enc ||
      enc.length < 32 ||
      /change.?me|secret|default|your.?encryption/i.test(enc);
    if (weak) {
      throw new Error(
        'Refusing to start: set strong JWT_SECRET and ENCRYPTION_KEY in production',
      );
    }
  }

  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api');

  // Security headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      crossOriginEmbedderPolicy: false,
    }),
  );

  // CORS (vírgula-separado; ex.: http://localhost:3000,http://localhost:3010)
  const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:3010,http://localhost:8080')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  app.enableCors({
    origin: corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins,
    credentials: true,
  });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Interceptors
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalInterceptors(new TransformInterceptor());

  // Exception filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('SORTE AGORA API')
    .setDescription('Platform API for SORTE AGORA betting platform')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('financial', 'Financial operations')
    .addTag('casino', 'Casino games')
    .addTag('sports', 'Sports betting')
    .addTag('vip', 'VIP program')
    .addTag('affiliates', 'Affiliate program')
    .addTag('admin', 'Admin operations')
    .addTag('health', 'Health check')
    .addTag('metrics', 'Prometheus metrics')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
  console.log(`🏥 Health check: http://localhost:${port}/api/health`);
}

bootstrap();
