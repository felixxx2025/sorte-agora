import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../common/decorators/user.decorator";
import { Public } from "../../common/decorators/public.decorator";
import { JwtAuthGuard } from "../../common/guards/auth.guard";
import { PromosService } from "./promos.service";

@ApiTags("promos")
@Controller("promos")
@UseGuards(JwtAuthGuard)
export class PromosController {
  constructor(private promosService: PromosService) {}

  @Public()
  @Get()
  listActive() {
    return this.promosService.listActive();
  }

  @Public()
  @Get(":idOrSlug")
  getOne(@Param("idOrSlug") idOrSlug: string) {
    return this.promosService.getActiveByIdOrSlug(idOrSlug);
  }

  @Post(":idOrSlug/claim")
  claim(@CurrentUser() user: any, @Param("idOrSlug") idOrSlug: string) {
    return this.promosService.claim(user.id, idOrSlug);
  }
}
