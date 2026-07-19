import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  CasinoLaunchRequest,
  CasinoLaunchResult,
  CasinoProvider,
} from "./casino-provider.interface";

@Injectable()
export class DemoCasinoProvider implements CasinoProvider {
  readonly name = "demo";

  constructor(private config: ConfigService) {}

  async launch(request: CasinoLaunchRequest): Promise<CasinoLaunchResult> {
    const frontend = this.config.get("FRONTEND_URL") || "http://localhost:3000";
    const { game, sessionToken } = request;
    const gameUrl = `${frontend}/casino/play?game=${encodeURIComponent(game.providerGameId)}&token=${sessionToken}&name=${encodeURIComponent(game.name)}&session=${sessionToken}`;
    return { gameUrl, mode: "demo" };
  }
}
