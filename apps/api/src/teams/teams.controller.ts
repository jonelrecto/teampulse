import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
  ParseArrayPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TeamMemberGuard } from './guards/team-member.guard';
import { TeamAdminGuard } from './guards/team-admin.guard';
import { User } from '../common/decorators/user.decorator';

@ApiTags('teams')
@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  // Public endpoint - must be before @UseGuards
  @Get('join/:code')
  @ApiOperation({ summary: 'Get team by invite code (public endpoint)' })
  @ApiResponse({ status: 200, description: 'Team information retrieved' })
  @ApiResponse({ status: 404, description: 'Invalid invite code' })
  getTeamByCode(@Param('code') code: string) {
    return this.teamsService.getTeamByCode(code);
  }

  // Protected endpoints below
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new team' })
  @ApiResponse({ status: 201, description: 'Team created successfully' })
  create(@User() user: any, @Body() createTeamDto: CreateTeamDto) {
    return this.teamsService.create(user.id, createTeamDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all teams for current user' })
  @ApiResponse({ status: 200, description: 'Teams retrieved successfully' })
  findAll(@User() user: any) {
    return this.teamsService.findAll(user.id);
  }

  @Get(':teamId')
  @UseGuards(JwtAuthGuard, TeamMemberGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get team by ID' })
  @ApiResponse({ status: 200, description: 'Team retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Not a team member' })
  @ApiResponse({ status: 404, description: 'Team not found' })
  findOne(@Param('teamId', ParseUUIDPipe) id: string, @User() user: any) {
    return this.teamsService.findOne(id, user.id);
  }

  @Put(':teamId')
  @UseGuards(JwtAuthGuard, TeamMemberGuard, TeamAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update team (Admin only)' })
  @ApiResponse({ status: 200, description: 'Team updated successfully' })
  @ApiResponse({ status: 403, description: 'Not a team admin' })
  update(
    @Param('teamId', ParseUUIDPipe) id: string,
    @User() user: any,
    @Body() updateTeamDto: UpdateTeamDto,
  ) {
    return this.teamsService.update(id, user.id, updateTeamDto);
  }

  @Delete(':teamId')
  @UseGuards(JwtAuthGuard, TeamMemberGuard, TeamAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete team (Admin only)' })
  @ApiResponse({ status: 200, description: 'Team deleted successfully' })
  @ApiResponse({ status: 403, description: 'Not a team admin' })
  remove(@Param('teamId', ParseUUIDPipe) id: string, @User() user: any) {
    return this.teamsService.remove(id, user.id);
  }

  // @Get(':teamId/role')
  // @UseGuards(JwtAuthGuard, TeamMemberGuard, TeamAdminGuard)
  // @ApiBearerAuth()
  // userRole(@Param('teamId', ParseUUIDPipe) id: string, @User() user: any) {
  //   return this.teamsService.userRole(id, user.id);
  // }
  // Invite Code
  @Post(':teamId/regenerate-invite')
  @UseGuards(JwtAuthGuard, TeamMemberGuard, TeamAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Regenerate invite code (Admin only)' })
  @ApiResponse({ status: 200, description: 'Invite code regenerated successfully' })
  @ApiResponse({ status: 403, description: 'Not a team admin' })
  regenerate(@Param('teamId', ParseUUIDPipe) id: string, @User() user: any) {
    return this.teamsService.regenerate(id, user.id);
  }

  @Post('join/:code')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Join team with invite code (requires authentication)' })
  @ApiResponse({ status: 201, description: 'Successfully joined team' })
  @ApiResponse({ status: 400, description: 'Already a member or invalid code' })
  @ApiResponse({ status: 404, description: 'Invalid invite code' })
  joinTeam(@Param('code') code: string, @User() user: any) {
    return this.teamsService.joinTeam(code, user.id);
  }

  // Team Check-in
  @Get(':teamId/check-ins')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the team checkins' })
  teamCheckins(@Param('teamId', ParseUUIDPipe) id: string, @User() user: any) {
    return this.teamsService.teamCheckins(id, user.id);
  }
  
  // Team Members
  @Get(':teamId/members')
  @UseGuards(JwtAuthGuard, TeamMemberGuard, TeamAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the team members'})
  teamMembers(@Param('teamId', ParseUUIDPipe) id: string) {
    return this.teamsService.teamMembers(id);
  }

  @Delete(':teamId/members/:userId')
  @UseGuards(JwtAuthGuard, TeamMemberGuard, TeamAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a team member (Admin only)' })
  removeMember(
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @User() user: any,
  ) {
    return this.teamsService.removeMember(teamId, userId, user.id);
  }

}