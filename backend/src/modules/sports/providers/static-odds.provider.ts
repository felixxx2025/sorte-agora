import { Injectable } from "@nestjs/common";
import { OddsProvider, OddsQuote } from "./odds-provider.interface";

/** Provider estático — não altera odds (fonte = Prisma/seed). */
@Injectable()
export class StaticOddsProvider implements OddsProvider {
  readonly name = "static";

  async fetchQuotes(): Promise<OddsQuote[]> {
    return [];
  }
}
