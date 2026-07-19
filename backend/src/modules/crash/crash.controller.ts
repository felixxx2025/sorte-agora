import {
  Body,
  Controller,
  Get,
  Post,
  ServiceUnavailableException,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator";
import { CurrentUser } from "../../common/decorators/user.decorator";
import { JwtAuthGuard } from "../../common/guards/auth.guard";
import { FeatureFlagsService } from "../../common/services/feature-flags.service";
import { CrashBetDto } from "./dto/crash-bet.dto";
import { CrashService } from "./crash.service";

@ApiTags("crash")
@Controller("crash")
@UseGuards(JwtAuthGuard)
export class CrashController {
  constructor(
    private crashService: CrashService,
    private flags: FeatureFlagsService,
  ) {}

  private assertEnabled() {
    if (!this.flags.crash) {
      throw new ServiceUnavailableException("Crash is disabled");
    }
  }

  @Public()
  @Get("state")
  getState(@CurrentUser() user?: any) {
    this.assertEnabled();
    return this.crashService.getState(user?.id);
  }

  @Post("bet")
  placeBet(@CurrentUser() user: any, @Body() dto: CrashBetDto) {
    this.assertEnabled();
    return this.crashService.placeBet(user.id, Number(dto.amount));
  }

  @Post("cashout")
  cashout(@CurrentUser() user: any) {
    this.assertEnabled();
    return this.crashService.cashout(user.id);
  }
}
