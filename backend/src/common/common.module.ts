import { Module, Global } from '@nestjs/common';
import { EncryptionService } from './services/encryption.service';
import { TokenBlacklistService } from './services/token-blacklist.service';

@Global()
@Module({
  providers: [EncryptionService, TokenBlacklistService],
  exports: [EncryptionService, TokenBlacklistService],
})
export class CommonModule {}
