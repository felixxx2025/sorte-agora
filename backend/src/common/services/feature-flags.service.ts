import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

/**
 * Feature flags via env (Fase C).
 * ENABLE_CASINO / ENABLE_SPORTS / ENABLE_VIP / ENABLE_AFFILIATES / ENABLE_LGPD
 * ENABLE_CRASH / ENABLE_CHAT
 */
@Injectable()
export class FeatureFlagsService {
  constructor(private config: ConfigService) {}

  private flag(key: string, defaultOn = true): boolean {
    const v = this.config.get(key);
    if (v === undefined || v === null || v === "") return defaultOn;
    return String(v).toLowerCase() !== "false" && v !== "0";
  }

  get casino() {
    return this.flag("ENABLE_CASINO");
  }

  get sports() {
    return this.flag("ENABLE_SPORTS");
  }

  get vip() {
    return this.flag("ENABLE_VIP");
  }

  get affiliates() {
    return this.flag("ENABLE_AFFILIATES");
  }

  get lgpd() {
    return this.flag("ENABLE_LGPD", true);
  }

  get crash() {
    return this.flag("ENABLE_CRASH");
  }

  get chat() {
    return this.flag("ENABLE_CHAT");
  }

  snapshot() {
    return {
      casino: this.casino,
      sports: this.sports,
      vip: this.vip,
      affiliates: this.affiliates,
      lgpd: this.lgpd,
      crash: this.crash,
      chat: this.chat,
      pixAutoConfirm: this.config.get("PIX_AUTO_CONFIRM") === "true",
      pixProviderMode: this.config.get("PIX_PROVIDER_MODE") || "sandbox",
      casinoMode: this.config.get("CASINO_PROVIDER_MODE") || "demo",
      sportsOddsMode: this.config.get("SPORTS_ODDS_MODE") || "static",
    };
  }
}
