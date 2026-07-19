import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import {
  CasinoLaunchRequest,
  CasinoLaunchResult,
  CasinoProvider,
} from './casino-provider.interface';

/**
 * Adapter HTTP live — monta URL assinada do provedor.
 * Requer CASINO_PROVIDER_BASE_URL (+ opcional CASINO_PROVIDER_API_KEY).
 */
@Injectable()
export class LiveCasinoProvider implements CasinoProvider {
  readonly name = 'live';

  constructor(private config: ConfigService) {}

  async launch(request: CasinoLaunchRequest): Promise<CasinoLaunchResult> {
    const base =
      this.config.get('CASINO_PROVIDER_BASE_URL') ||
      'https://demo-casino.sorteagora.local';
    const apiKey = this.config.get('CASINO_PROVIDER_API_KEY') || '';
    const { game, sessionToken, userId } = request;

    const qs = new URLSearchParams({
      token: sessionToken,
      user: userId,
      game: game.providerGameId,
    });

    if (apiKey) {
      const sig = crypto
        .createHmac('sha256', apiKey)
        .update(`${sessionToken}:${game.providerGameId}`)
        .digest('hex');
      qs.set('sig', sig);
    }

    const gameUrl = `${base.replace(/\/$/, '')}/launch/${game.provider}/${game.providerGameId}?${qs.toString()}`;
    return { gameUrl, mode: 'live' };
  }
}
