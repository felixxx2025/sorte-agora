import { Global, Module } from '@nestjs/common';
import { EncryptionService } from './services/encryption.service';
import { MailService } from './services/mail.service';
import { TokenBlacklistService } from './services/token-blacklist.service';

@Global()
@Module({
  providers: [EncryptionService, TokenBlacklistService, MailService],
  exports: [EncryptionService, TokenBlacklistService, MailService],
})
export class CommonModule {}
