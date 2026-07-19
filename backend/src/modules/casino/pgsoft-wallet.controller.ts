import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { Public } from "../../common/decorators/public.decorator";
import { JwtAuthGuard } from "../../common/guards/auth.guard";
import { PgSoftWalletService } from "./pgsoft-wallet.service";

/**
 * Callbacks wallet PG Soft (seamless).
 * Configure no backoffice PG Soft a base: {API}/api/pgsoft
 */
@ApiTags("pgsoft")
@Controller("pgsoft")
@UseGuards(JwtAuthGuard)
export class PgSoftWalletController {
  constructor(private wallet: PgSoftWalletService) {}

  @Public()
  @Throttle({ default: { limit: 120, ttl: 60000 } })
  @Post("VerifySession")
  verifySession(@Body() body: any) {
    return this.wallet.verifySession(body);
  }

  @Public()
  @Throttle({ default: { limit: 120, ttl: 60000 } })
  @Post("Cash/Get")
  cashGet(@Body() body: any) {
    return this.wallet.getBalance(body);
  }

  @Public()
  @Throttle({ default: { limit: 300, ttl: 60000 } })
  @Post("Cash/TransferInOut")
  transferInOut(@Body() body: any) {
    return this.wallet.transferInOut(body);
  }

  /** Alias lowercase usados por alguns aggregators */
  @Public()
  @Post("verifySession")
  verifySessionAlias(@Body() body: any) {
    return this.wallet.verifySession(body);
  }

  @Public()
  @Post("cash/get")
  cashGetAlias(@Body() body: any) {
    return this.wallet.getBalance(body);
  }

  @Public()
  @Post("cash/transferInOut")
  transferAlias(@Body() body: any) {
    return this.wallet.transferInOut(body);
  }
}
