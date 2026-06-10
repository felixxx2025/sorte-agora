import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/auth.guard';
import { CasinoService } from './casino.service';
import { LaunchGameDto } from './dto/launch-game.dto';

@Controller('casino')
@UseGuards(JwtAuthGuard)
export class CasinoController {
  constructor(private casinoService: CasinoService) { }

  @Public()
  @Get('games')
  getGames(@Query('category') category?: string) {
    return this.casinoService.getGames(category);
  }

  @Get('games/:id')
  getGame(@Param('id') id: string) {
    return this.casinoService.getGame(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('games/:id/launch')
  launchGame(@Param('id') id: string, @Body() launchGameDto: LaunchGameDto) {
    return this.casinoService.launchGame(id, launchGameDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('sessions')
  getSessions(@Body() userId: string) {
    return this.casinoService.getSessions(userId);
  }
}
