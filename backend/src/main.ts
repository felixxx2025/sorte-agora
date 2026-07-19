import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";
import { join } from "path";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor";
import { TransformInterceptor } from "./common/interceptors/transform.interceptor";
import { MailService } from "./common/services/mail.service";
import "./tracing";

function secretsAreWeak(): boolean {
  const jwt = process.env.JWT_SECRET || "";
  const enc = process.env.ENCRYPTION_KEY || "";
  return (
    !jwt ||
    jwt.length < 32 ||
    /change.?me|secret|default|your.?jwt/i.test(jwt) ||
    !enc ||
    enc.length < 32 ||
    /change.?me|secret|default|your.?encryption/i.test(enc)
  );
}

async function bootstrap() {
  const env = process.env.NODE_ENV || "development";
  const enforce =
    env === "production" ||
    env === "staging" ||
    process.env.REQUIRE_STRONG_SECRETS === "true";

  if (enforce && secretsAreWeak()) {
    throw new Error(
      "Refusing to start: set strong JWT_SECRET and ENCRYPTION_KEY (min 32 chars, no defaults)",
    );
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const uploadRoot =
    process.env.STORAGE_LOCAL_PATH || join(process.cwd(), "uploads");
  app.useStaticAssets(uploadRoot, { prefix: "/uploads/" });

  app.setGlobalPrefix("api");

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:", "http:"],
        },
      },
      crossOriginEmbedderPolicy: false,
    }),
  );

  const corsOrigins = (
    process.env.CORS_ORIGIN ||
    "http://localhost:3000,http://localhost:3010,http://localhost:8080"
  )
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  app.enableCors({
    origin: corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  const mail = app.get(MailService);
  if ((env === "staging" || env === "production") && !mail.isSmtpReady()) {
    // eslint-disable-next-line no-console
    console.warn(
      "⚠️  SMTP not configured — password reset emails will only be logged",
    );
  }

  const config = new DocumentBuilder()
    .setTitle("SORTE AGORA API")
    .setDescription("Platform API for SORTE AGORA betting platform")
    .setVersion("1.5")
    .addTag("auth", "Authentication endpoints")
    .addTag("users", "User management")
    .addTag("financial", "Financial operations")
    .addTag("webhooks", "PIX and provider webhooks")
    .addTag("casino", "Casino games")
    .addTag("sports", "Sports betting")
    .addTag("vip", "VIP program")
    .addTag("affiliates", "Affiliate program")
    .addTag("admin", "Admin operations")
    .addTag("lgpd", "Privacy / data subject rights")
    .addTag("health", "Health check")
    .addTag("metrics", "Prometheus metrics")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
  console.log(`🏥 Health check: http://localhost:${port}/api/health`);
}

bootstrap();
