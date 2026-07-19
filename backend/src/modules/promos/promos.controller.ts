import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
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
}
