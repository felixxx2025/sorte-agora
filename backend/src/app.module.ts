import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule } from '@nestjs/throttler';

import { AdminModule } from './modules/admin/admin.module';
import { AffiliatesModule } from './modules/affiliates/affiliates.module';
import { AuditModule } from './modules/audit/audit.module';
import { AuthModule } from './modules/auth/auth.module';
import { CasinoModule } from './modules/casino/casino.module';
import { FinancialModule } from './modules/financial/financial.module';
import { SportsModule } from './modules/sports/sports.module';
import { UsersModule } from './modules/users/users.module';
import { VipModule } from './modules/vip/vip.module';

import { CommonModule } from './common/common.module';
import { JwtAuthGuard } from './common/guards/auth.guard';
import { MetricsModule } from './common/modules/metrics.module';
import { SentryModule } from './common/sentry/sentry.module';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './database/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    EventEmitterModule.forRoot(),
    DatabaseModule,
    RedisModule,
    CommonModule,
    SentryModule,
    AuthModule,
    UsersModule,
    FinancialModule,
    CasinoModule,
    SportsModule,
    VipModule,
    AffiliatesModule,
    AdminModule,
    AuditModule,
    MetricsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule { }
