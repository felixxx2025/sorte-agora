import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/auth.guard';
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

  @UseGuards(JwtAuthGuard)
  @Post('bets')
  placeBet(@Body() placeBetDto: PlaceBetDto) {
    return this.sportsService.placeBet(placeBetDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('bets')
  getBets(@Body() userId: string) {
    return this.sportsService.getBets(userId);
  }
}
