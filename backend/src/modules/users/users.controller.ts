import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../../common/guards/auth.guard";
import { CurrentUser } from "../../common/decorators/user.decorator";
import { UsersService } from "./users.service";
import { ResponsibleGamingDto } from "./dto/responsible-gaming.dto";
import { SubmitKycDto } from "./dto/submit-kyc.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Controller("users")
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get("profile")
  getProfile(@CurrentUser() user: any) {
    return this.usersService.getProfile(user.id);
  }

  @Put("profile")
  updateProfile(
    @CurrentUser() user: any,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateProfile(user.id, updateUserDto);
  }

  @Put("responsible-gaming")
  updateResponsibleGaming(
    @CurrentUser() user: any,
    @Body() dto: ResponsibleGamingDto,
  ) {
    return this.usersService.updateResponsibleGaming(user.id, dto);
  }

  @Get("favorites")
  listFavorites(@CurrentUser() user: any) {
    return this.usersService.listFavorites(user.id);
  }

  @Post("favorites/:gameId")
  toggleFavorite(
    @CurrentUser() user: any,
    @Param("gameId") gameId: string,
  ) {
    return this.usersService.toggleFavorite(user.id, gameId);
  }

  @Post("kyc")
  submitKyc(@CurrentUser() user: any, @Body() dto: SubmitKycDto) {
    return this.usersService.submitKyc(user.id, dto);
  }

  @Get("kyc")
  getKycStatus(@CurrentUser() user: any) {
    return this.usersService.getKycStatus(user.id);
  }

  @Get("me/export")
  exportMyData(@CurrentUser() user: any) {
    return this.usersService.exportMyData(user.id);
  }

  @Delete("me")
  deleteMyAccount(@CurrentUser() user: any) {
    return this.usersService.deleteMyAccount(user.id);
  }

  @Post("me/self-exclude")
  selfExclude(@CurrentUser() user: any, @Body() body: { days: number }) {
    return this.usersService.selfExclude(user.id, Number(body.days));
  }
}
