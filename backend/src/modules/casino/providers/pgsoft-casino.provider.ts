import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import {
  CasinoLaunchRequest,
  CasinoLaunchResult,
  CasinoProvider,
} from "./casino-provider.interface";

/**
 * PG Soft — launch de jogos via External Game Launcher.
 *
 * Produção: PGSOFT_API_BASE_URL + PGSOFT_OPERATOR_TOKEN (+ secret opcional).
 * Sem credenciais: fallback sandbox para /casino/play (catálogo PGSOFT jogável em demo).
 *
 * Contrato típico (GetLaunchURLHTML): form-urlencoded com operator_token, path, extra_args.
 * Ajuste PGSOFT_LAUNCH_PATH se o parceiro usar outro endpoint.
 */
@Injectable()
export class PgSoftCasinoProvider implements CasinoProvider {
  readonly name = "pgsoft";
  private readonly logger = new Logger(PgSoftCasinoProvider.name);

  constructor(private config: ConfigService) {}

  async launch(request: CasinoLaunchRequest): Promise<CasinoLaunchResult> {
    const apiBase = (this.config.get("PGSOFT_API_BASE_URL") || "").trim();
    const operatorToken = (
      this.config.get("PGSOFT_OPERATOR_TOKEN") || ""
    ).trim();
    const frontend =
      this.config.get("FRONTEND_URL") || "http://localhost:8088";

    if (!apiBase || !operatorToken) {
      this.logger.warn(
        "PG Soft sem PGSOFT_API_BASE_URL/OPERATOR_TOKEN — launch sandbox local",
      );
      const gameUrl = `${frontend.replace(/\/$/, "")}/casino/play?provider=PGSOFT&game=${encodeURIComponent(request.game.providerGameId)}&name=${encodeURIComponent(request.game.name)}&token=${request.sessionToken}&session=${request.sessionToken}`;
      return { gameUrl, mode: "pgsoft-sandbox" };
    }

    const launchPath =
      this.config.get("PGSOFT_LAUNCH_PATH") ||
      "/external-game-launcher/api/v1/GetLaunchURLHTML";
    const lang = this.config.get("PGSOFT_LANG") || "pt";
    const currency = this.config.get("PGSOFT_CURRENCY") || "BRL";
    const path = `/${request.game.providerGameId}/index.html`;
    const extraArgs = [
      `btt=1`,
      `ops=${request.sessionToken}`,
      `l=${lang}`,
      `f=${currency}`,
    ].join("&");

    const body = new URLSearchParams({
      operator_token: operatorToken,
      path,
      extra_args: extraArgs,
      url_type: "game-entry",
      client_ip: "127.0.0.1",
    });

    const secret = (this.config.get("PGSOFT_SECRET_KEY") || "").trim();
    const headers: Record<string, string> = {
      "Content-Type": "application/x-www-form-urlencoded",
    };
    if (secret) {
      headers["x-operator-token"] = operatorToken;
      // Hash opcional — muitos ambientes PG Soft usam operator token no body apenas
    }

    try {
      const url = `${apiBase.replace(/\/$/, "")}${launchPath.startsWith("/") ? launchPath : `/${launchPath}`}`;
      const res = await axios.post(url, body.toString(), {
        headers,
        timeout: 15000,
        validateStatus: () => true,
      });

      const data = res.data;
      const gameUrl =
        data?.data?.gameURL ||
        data?.data?.url ||
        data?.gameURL ||
        data?.url ||
        (typeof data === "string" && data.startsWith("http") ? data : null);

      if (!gameUrl) {
        this.logger.error(
          `PG Soft launch sem URL (status ${res.status}): ${JSON.stringify(data)?.slice(0, 400)}`,
        );
        throw new ServiceUnavailableException(
          "PG Soft não retornou URL de lançamento",
        );
      }

      return { gameUrl: String(gameUrl), mode: "pgsoft" };
    } catch (err: any) {
      if (err instanceof ServiceUnavailableException) throw err;
      this.logger.error(`PG Soft launch failed: ${err?.message}`);
      throw new ServiceUnavailableException(
        err?.response?.data?.error?.message ||
          err?.message ||
          "Falha ao iniciar jogo PG Soft",
      );
    }
  }
}
