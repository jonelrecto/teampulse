import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TeamMemberGuard } from './guards/team-member.guard';
import { TeamAdminGuard } from './guards/team-admin.guard';
import { CurrentUser } from '../common/decorators/user.decorator';

@ApiTags('teams')
@ApiBearerAuth()
@Controller('teams')
@UseGuards(JwtAuthGuard)
export class TeamsController {
  constructor(private teamsService: TeamsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new team' })
  @ApiResponse({ status: 201, description: 'Team created' })
  async create(@CurrentUser() user: any, @Body() dto: CreateTeamDto) {
    return this.teamsService.create(user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all teams for current user' })
  @ApiResponse({ status: 200, description: 'Teams retrieved' })
  async findAll(@CurrentUser() user: any) {
    return this.teamsService.findAll(user.userId);
  }

  @Get(':id')
  @UseGuards(TeamMemberGuard)
  @ApiOperation({ summary: 'Get team by ID' })
  @ApiResponse({ status: 200, description: 'Team retrieved' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.teamsService.findOne(id, user.userId);
  }

  @Patch(':id')
  @UseGuards(TeamMemberGuard, TeamAdminGuard)
  @ApiOperation({ summary: 'Update team' })
  @ApiResponse({ status: 200, description: 'Team updated' })
  async update(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: UpdateTeamDto) {
    return this.teamsService.update(id, user.userId, dto);
  }

  @Delete(':id')
  @UseGuards(TeamMemberGuard, TeamAdminGuard)
  @ApiOperation({ summary: 'Delete team' })
  @ApiResponse({ status: 200, description: 'Team deleted' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.teamsService.remove(id, user.userId);
  }

  @Post(':id/regenerate-invite')
  @UseGuards(TeamMemberGuard, TeamAdminGuard)
  @ApiOperation({ summary: 'Regenerate team invite code' })
  @ApiResponse({ status: 200, description: 'Invite code regenerated' })
  async regenerateInvite(@Param('id') id: string, @CurrentUser() user: any) {
    return this.teamsService.regenerateInviteCode(id, user.userId);
  }

  @Get('join/:code')
  @ApiOperation({ summary: 'Get team by invite code' })
  @ApiResponse({ status: 200, description: 'Team retrieved' })
  async getTeamByCode(@Param('code') code: string) {
    return this.teamsService.findByInviteCode(code);
  }

  @Post('join/:code')
  @ApiOperation({ summary: 'Join team with invite code' })
  @ApiResponse({ status: 201, description: 'Joined team' })
  async joinTeam(@Param('code') code: string, @CurrentUser() user: any) {
    return this.teamsService.joinTeam(code, user.userId);
  }

  @Get(':id/members')
  @UseGuards(TeamMemberGuard)
  @ApiOperation({ summary: 'Get team members' })
  @ApiResponse({ status: 200, description: 'Members retrieved' })
  async getMembers(@Param('id') id: string, @CurrentUser() user: any) {
    return this.teamsService.getMembers(id, user.userId);
  }

  @Delete(':id/members/:userId')
  @UseGuards(TeamMemberGuard, TeamAdminGuard)
  @ApiOperation({ summary: 'Remove team member' })
  @ApiResponse({ status: 200, description: 'Member removed' })
  async removeMember(
    @Param('id') id: string,
    @Param('userId') memberUserId: string,
    @CurrentUser() user: any,
  ) {
    return this.teamsService.removeMember(id, memberUserId, user.userId);
  }

  @Patch(':id/transfer-admin')
  @UseGuards(TeamMemberGuard, TeamAdminGuard)
  @ApiOperation({ summary: 'Transfer admin role to another member' })
  @ApiResponse({ status: 200, description: 'Admin role transferred' })
  async transferAdmin(
    @Param('id') id: string,
    @Body() body: { newAdminUserId: string },
    @CurrentUser() user: any,
  ) {
    return this.teamsService.transferAdmin(id, body.newAdminUserId, user.userId);
  }
}
