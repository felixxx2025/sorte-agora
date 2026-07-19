import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  ServiceUnavailableException,
  UseGuards,
} from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/user.decorator";
import { Public } from "../../common/decorators/public.decorator";
import { JwtAuthGuard } from "../../common/guards/auth.guard";
import { FeatureFlagsService } from "../../common/services/feature-flags.service";
import { CasinoService } from "./casino.service";
import { LaunchGameDto } from "./dto/launch-game.dto";

@Controller("casino")
@UseGuards(JwtAuthGuard)
export class CasinoController {
  constructor(
    private casinoService: CasinoService,
    private flags: FeatureFlagsService,
  ) {}

  private assertEnabled() {
    if (!this.flags.casino) {
      throw new ServiceUnavailableException("Casino is disabled");
    }
  }

  @Public()
  @Get("games")
  getGames(@Query("category") category?: string) {
    this.assertEnabled();
    return this.casinoService.getGames(category);
  }

  @Get("games/:id")
  getGame(@Param("id") id: string) {
    this.assertEnabled();
    return this.casinoService.getGame(id);
  }

  @Post("games/:id/launch")
  launchGame(
    @Param("id") id: string,
    @CurrentUser() user: any,
    @Body() launchGameDto: LaunchGameDto,
  ) {
    this.assertEnabled();
    return this.casinoService.launchGame(id, {
      ...launchGameDto,
      userId: user.id,
    } as any);
  }

  @Get("sessions")
  getSessions(@CurrentUser() user: any) {
    this.assertEnabled();
    return this.casinoService.getSessions(user.id);
  }
}
