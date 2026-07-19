import { Global, Module } from '@nestjs/common';
import { CacheService } from './services/cache.service';
import { EncryptionService } from './services/encryption.service';
import { MailService } from './services/mail.service';
import { TokenBlacklistService } from './services/token-blacklist.service';

@Global()
@Module({
  providers: [
    EncryptionService,
    TokenBlacklistService,
    MailService,
    CacheService,
  ],
  exports: [
    EncryptionService,
    TokenBlacklistService,
    MailService,
    CacheService,
  ],
})
export class CommonModule {}
