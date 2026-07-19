import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PlaceBetDto } from './dto/place-bet.dto';
import { SportsService } from './sports.service';

@Controller('sports')
@UseGuards(JwtAuthGuard)
export class SportsController {
  constructor(private sportsService: SportsService) { }

  @Public()
  @Get('events')
  getEvents(@Query('isLive') isLive?: string) {
    return this.sportsService.getEvents(isLive === 'true');
  }

  @Get('events/:id')
  getEvent(@Param('id') id: string) {
    return this.sportsService.getEvent(id);
  }

  @Post('bets')
  placeBet(@CurrentUser() user: any, @Body() placeBetDto: PlaceBetDto) {
    return this.sportsService.placeBet({
      ...placeBetDto,
      userId: user.id,
    });
  }

  @Get('bets')
  getBets(@CurrentUser() user: any) {
    return this.sportsService.getBets(user.id);
  }

  @Put('bets/:id/settle')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  settleBet(
    @Param('id') id: string,
    @Body() body: { result: 'WON' | 'LOST' },
  ) {
    return this.sportsService.settleBet(id, body.result);
  }
}
