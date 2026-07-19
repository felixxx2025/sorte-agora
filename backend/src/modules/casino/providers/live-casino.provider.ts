import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as crypto from "crypto";
import {
  CasinoLaunchRequest,
  CasinoLaunchResult,
  CasinoProvider,
} from "./casino-provider.interface";

/**
 * Adapter HTTP live — monta URL assinada do provedor.
 * Exige CASINO_PROVIDER_BASE_URL. API key obrigatória se CASINO_REQUIRE_API_KEY=true.
 */
@Injectable()
export class LiveCasinoProvider implements CasinoProvider {
  readonly name = "live";

  constructor(private config: ConfigService) {}

  async launch(request: CasinoLaunchRequest): Promise<CasinoLaunchResult> {
    const base = (this.config.get("CASINO_PROVIDER_BASE_URL") || "").trim();
    if (!base) {
      throw new ServiceUnavailableException(
        "CASINO_PROVIDER_BASE_URL required for live mode",
      );
    }

    const apiKey = this.config.get("CASINO_PROVIDER_API_KEY") || "";
    if (this.config.get("CASINO_REQUIRE_API_KEY") === "true" && !apiKey) {
      throw new BadRequestException(
        "CASINO_PROVIDER_API_KEY required when CASINO_REQUIRE_API_KEY=true",
      );
    }

    const { game, sessionToken, userId } = request;

    const qs = new URLSearchParams({
      token: sessionToken,
      user: userId,
      game: game.providerGameId,
    });

    if (apiKey) {
      const sig = crypto
        .createHmac("sha256", apiKey)
        .update(`${sessionToken}:${game.providerGameId}`)
        .digest("hex");
      qs.set("sig", sig);
    }

    const gameUrl = `${base.replace(/\/$/, "")}/launch/${game.provider}/${game.providerGameId}?${qs.toString()}`;
    return { gameUrl, mode: "live" };
  }
}
