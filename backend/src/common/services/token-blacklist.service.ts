import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class TokenBlacklistService {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) { }

  async addToBlacklist(token: string, expiresIn: number): Promise<void> {
    const key = `blacklist:${token}`;
    await this.redis.setex(key, expiresIn, '1');
  }

  async isBlacklisted(token: string): Promise<boolean> {
    const key = `blacklist:${token}`;
    const result = await this.redis.exists(key);
    return result === 1;
  }

  async removeFromBlacklist(token: string): Promise<void> {
    const key = `blacklist:${token}`;
    await this.redis.del(key);
  }
}
