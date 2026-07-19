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
import { ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../common/decorators/user.decorator";
import { Public } from "../../common/decorators/public.decorator";
import { JwtAuthGuard } from "../../common/guards/auth.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { RolesGuard } from "../../common/guards/roles.guard";
import { FeatureFlagsService } from "../../common/services/feature-flags.service";
import { CasinoService } from "./casino.service";
import { LaunchGameDto } from "./dto/launch-game.dto";

@ApiTags("casino")
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
  @Get("jackpots")
  getJackpots() {
    this.assertEnabled();
    return this.casinoService.getJackpots();
  }

  @Public()
  @Get("games")
  getGames(
    @Query("category") category?: string,
    @Query("provider") provider?: string,
  ) {
    this.assertEnabled();
    return this.casinoService.getGames(category, provider);
  }

  @Public()
  @Get("games/by-slug/:slug")
  getGameBySlug(@Param("slug") slug: string) {
    this.assertEnabled();
    return this.casinoService.getGameBySlug(slug);
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

  @Post("games/:id/demo")
  launchDemo(@Param("id") id: string, @CurrentUser() user: any) {
    this.assertEnabled();
    return this.casinoService.launchDemo(id, user.id);
  }

  @Post("pgsoft/sync")
  @UseGuards(RolesGuard)
  @Roles("ADMIN")
  syncPgSoft() {
    this.assertEnabled();
    return this.casinoService.syncPgSoftCatalog();
  }

  @Get("sessions")
  getSessions(@CurrentUser() user: any) {
    this.assertEnabled();
    return this.casinoService.getSessions(user.id);
  }
}
