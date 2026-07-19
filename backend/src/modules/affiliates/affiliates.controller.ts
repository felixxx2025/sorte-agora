import {
  Body,
  Controller,
  Get,
  Post,
  ServiceUnavailableException,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../common/guards/auth.guard";
import { CurrentUser } from "../../common/decorators/user.decorator";
import { FeatureFlagsService } from "../../common/services/feature-flags.service";
import { AffiliatesService } from "./affiliates.service";
import { RegisterAffiliateDto } from "./dto/register-affiliate.dto";

@ApiTags("affiliates")
@Controller("affiliates")
@UseGuards(JwtAuthGuard)
export class AffiliatesController {
  constructor(
    private affiliatesService: AffiliatesService,
    private flags: FeatureFlagsService,
  ) {}

  private assertEnabled() {
    if (!this.flags.affiliates) {
      throw new ServiceUnavailableException("Affiliates is disabled");
    }
  }

  @Post("register")
  registerAffiliate(
    @CurrentUser() user: any,
    @Body() registerAffiliateDto: RegisterAffiliateDto,
  ) {
    this.assertEnabled();
    return this.affiliatesService.registerAffiliate(
      user.id,
      registerAffiliateDto,
    );
  }

  @Get("dashboard")
  getDashboard(@CurrentUser() user: any) {
    this.assertEnabled();
    return this.affiliatesService.getDashboard(user.id);
  }

  @Get("commissions")
  getCommissions(@CurrentUser() user: any) {
    this.assertEnabled();
    return this.affiliatesService.getCommissions(user.id);
  }
}
