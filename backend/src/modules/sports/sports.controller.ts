import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  ServiceUnavailableException,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../common/decorators/user.decorator";
import { Public } from "../../common/decorators/public.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../common/guards/auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { FeatureFlagsService } from "../../common/services/feature-flags.service";
import { PlaceBetDto } from "./dto/place-bet.dto";
import { SportsService } from "./sports.service";

@ApiTags("sports")
@Controller("sports")
@UseGuards(JwtAuthGuard)
export class SportsController {
  constructor(
    private sportsService: SportsService,
    private flags: FeatureFlagsService,
  ) {}

  private assertEnabled() {
    if (!this.flags.sports) {
      throw new ServiceUnavailableException("Sports is disabled");
    }
  }

  @Public()
  @Get("events")
  getEvents(@Query("isLive") isLive?: string) {
    this.assertEnabled();
    return this.sportsService.getEvents(isLive === "true");
  }

  @Get("events/:id")
  getEvent(@Param("id") id: string) {
    this.assertEnabled();
    return this.sportsService.getEvent(id);
  }

  @Post("bets")
  placeBet(@CurrentUser() user: any, @Body() placeBetDto: PlaceBetDto) {
    this.assertEnabled();
    return this.sportsService.placeBet(user.id, placeBetDto);
  }

  @Get("bets")
  getBets(@CurrentUser() user: any) {
    this.assertEnabled();
    return this.sportsService.getBets(user.id);
  }

  @Put("bets/:id/settle")
  @UseGuards(RolesGuard)
  @Roles("ADMIN")
  settleBet(@Param("id") id: string, @Body() body: { result: "WON" | "LOST" }) {
    this.assertEnabled();
    return this.sportsService.settleBet(id, body.result);
  }
}
