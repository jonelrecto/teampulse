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
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TeamMemberGuard } from './guards/team-member.guard';
import { TeamAdminGuard } from './guards/team-admin.guard';
import { User } from '../common/decorators/user.decorator';

@ApiTags('teams')
@Controller('teams')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new team' })
  create(@User() user: any, @Body() createTeamDto: CreateTeamDto) {
    return this.teamsService.create(user.id, createTeamDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all teams for current user' })
  findAll(@User() user: any) {
    return this.teamsService.findAll(user.id);
  }

  @Get(':teamId')
  @UseGuards(TeamMemberGuard)
  @ApiOperation({ summary: 'Get team by ID' })
  findOne(@Param('teamId', ParseUUIDPipe) id: string, @User() user: any) {
    return this.teamsService.findOne(id, user.id);
  }

  @Put(':teamId')
  @UseGuards(TeamAdminGuard)
  @ApiOperation({ summary: 'Update team' })
  update(
    @Param('teamId', ParseUUIDPipe) id: string,
    @User() user: any,
    @Body() updateTeamDto: UpdateTeamDto,
  ) {
    return this.teamsService.update(id, user.id, updateTeamDto);
  }

  @Delete(':teamId')
  @UseGuards(TeamAdminGuard)
  @ApiOperation({ summary: 'Delete team' })
  remove(@Param('teamId', ParseUUIDPipe) id: string, @User() user: any) {
    return this.teamsService.remove(id, user.id);
  }
}
