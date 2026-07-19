import * as Sentry from "@sentry/node";
import { Injectable, OnModuleInit } from "@nestjs/common";

@Injectable()
export class SentryService implements OnModuleInit {
  onModuleInit() {
    if (process.env.SENTRY_DSN) {
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV || "development",
        tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
        beforeSend(event, hint) {
          // Filtra informações sensíveis
          if (event.request) {
            delete event.request.cookies;
            delete event.request.headers;
          }
          return event;
        },
      });
    }
  }

  captureException(error: Error, context?: any) {
    Sentry.captureException(error, {
      extra: context,
    });
  }

  captureMessage(
    message: string,
    level: "info" | "warning" | "error" = "info",
  ) {
    Sentry.captureMessage(message, {
      level,
    });
  }

  setUser(user: any) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.email,
    });
  }

  clearUser() {
    Sentry.setUser(null);
  }
}
