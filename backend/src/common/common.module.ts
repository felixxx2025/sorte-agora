import { Global, Module } from '@nestjs/common';
import { CacheService } from './services/cache.service';
import { EncryptionService } from './services/encryption.service';
import { MailService } from './services/mail.service';
import { StorageService } from './services/storage.service';
import { TokenBlacklistService } from './services/token-blacklist.service';

@Global()
@Module({
  providers: [
    EncryptionService,
    TokenBlacklistService,
    MailService,
    CacheService,
    StorageService,
  ],
  exports: [
    EncryptionService,
    TokenBlacklistService,
    MailService,
    CacheService,
    StorageService,
  ],
})
export class CommonModule {}

