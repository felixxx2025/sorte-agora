import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import { OddsProvider, OddsQuote } from "./odds-provider.interface";

/**
 * Feed HTTP opcional. Sem SPORTS_ODDS_API_URL → retorna [] (usa odds do DB/seed).
 * Contrato esperado: GET {URL} → [{ selectionId|externalSelectionId, odds }]
 */
@Injectable()
export class HttpOddsProvider implements OddsProvider {
  readonly name = "http";
  private readonly logger = new Logger(HttpOddsProvider.name);

  constructor(private config: ConfigService) {}

  async fetchQuotes(): Promise<OddsQuote[]> {
    const url = (this.config.get("SPORTS_ODDS_API_URL") || "").trim();
    if (!url) return [];

    const key = this.config.get("SPORTS_ODDS_API_KEY") || "";
    try {
      const { data } = await axios.get(url, {
        timeout: 10000,
        headers: key ? { Authorization: `Bearer ${key}` } : undefined,
      });
      const list = Array.isArray(data) ? data : data?.quotes || data?.data || [];
      return (list as any[])
        .map((row) => ({
          selectionId: row.selectionId ? String(row.selectionId) : undefined,
          externalSelectionId: row.externalSelectionId
            ? String(row.externalSelectionId)
            : undefined,
          odds: Number(row.odds),
        }))
        .filter((q) => q.odds > 1);
    } catch (err: any) {
      this.logger.warn(`Odds feed unavailable: ${err?.message}`);
      return [];
    }
  }
}
