import { Controller, Get, Param, Query, UseGuards, ParseUUIDPipe, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TeamMemberGuard } from '../teams/guards/team-member.guard';
import { User } from '../common/decorators/user.decorator';

@ApiTags('analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('teams/:teamId/stats')
  @UseGuards(TeamMemberGuard)
  @ApiOperation({ summary: 'Get team statistics' })
  getTeamStats(
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @User() user: any,
  ) {
    return this.analyticsService.getTeamStats(teamId, user.id);
  }

  @Get('teams/:teamId/check-ins')
  @UseGuards(TeamMemberGuard)
  @ApiOperation({ summary: 'Get team check-ins for analytics' })
  getTeamCheckIns(
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @Query('days', new ParseIntPipe({ optional: true })) days: number = 7,
    @User() user: any,
  ) {
    return this.analyticsService.getTeamCheckIns(teamId, user.id, days);
  }
}
