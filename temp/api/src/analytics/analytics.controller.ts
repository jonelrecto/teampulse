import { Controller, Get, Param, Query, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TeamMemberGuard } from '../teams/guards/team-member.guard';
import { CurrentUser } from '../common/decorators/user.decorator';

@ApiTags('analytics')
@ApiBearerAuth()
@Controller('teams/:teamId/analytics')
@UseGuards(JwtAuthGuard, TeamMemberGuard)
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('participation')
  @ApiOperation({ summary: 'Get participation analytics' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Participation analytics retrieved' })
  async getParticipation(
    @Param('teamId') teamId: string,
    @CurrentUser() user: any,
    @Query('days') days?: string,
  ) {
    return this.analyticsService.getParticipation(teamId, user.userId, days ? parseInt(days) : 7);
  }

  @Get('mood')
  @ApiOperation({ summary: 'Get mood analytics' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Mood analytics retrieved' })
  async getMood(
    @Param('teamId') teamId: string,
    @CurrentUser() user: any,
    @Query('days') days?: string,
  ) {
    return this.analyticsService.getMoodAnalytics(teamId, user.userId, days ? parseInt(days) : 7);
  }

  @Get('energy')
  @ApiOperation({ summary: 'Get energy analytics' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Energy analytics retrieved' })
  async getEnergy(
    @Param('teamId') teamId: string,
    @CurrentUser() user: any,
    @Query('days') days?: string,
  ) {
    return this.analyticsService.getEnergyAnalytics(teamId, user.userId, days ? parseInt(days) : 7);
  }

  @Get('blockers')
  @ApiOperation({ summary: 'Get blocker keywords' })
  @ApiResponse({ status: 200, description: 'Blocker keywords retrieved' })
  async getBlockers(@Param('teamId') teamId: string, @CurrentUser() user: any) {
    return this.analyticsService.getBlockers(teamId, user.userId);
  }

  @Get('streaks')
  @ApiOperation({ summary: 'Get streak leaderboard' })
  @ApiResponse({ status: 200, description: 'Streaks retrieved' })
  async getStreaks(@Param('teamId') teamId: string, @CurrentUser() user: any) {
    return this.analyticsService.getStreaks(teamId, user.userId);
  }

  @Get('export')
  @ApiOperation({ summary: 'Export check-ins as CSV' })
  @ApiResponse({ status: 200, description: 'CSV exported' })
  async export(
    @Param('teamId') teamId: string,
    @CurrentUser() user: any,
    @Res() res: Response,
  ) {
    const csv = await this.analyticsService.exportCheckIns(teamId, user.userId);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="check-ins-${teamId}.csv"`);
    res.send(csv);
  }
}
