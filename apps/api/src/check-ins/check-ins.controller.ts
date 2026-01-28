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
import { CheckInsService } from './check-ins.service';
import { CreateCheckInDto } from './dto/create-check-in.dto';
import { UpdateCheckInDto } from './dto/update-check-in.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TeamMemberGuard } from '../teams/guards/team-member.guard';
import { User } from '../common/decorators/user.decorator';

@ApiTags('check-ins')
@Controller('check-ins')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CheckInsController {
  constructor(private readonly checkInsService: CheckInsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new check-in' })
  create(@User() user: any, @Body() createCheckInDto: CreateCheckInDto) {
    return this.checkInsService.create(user.id, createCheckInDto);
  }

  @Get('team/:teamId')
  @UseGuards(TeamMemberGuard)
  @ApiOperation({ summary: 'Get all check-ins for a team' })
  findAll(
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @User() user: any,
  ) {
    return this.checkInsService.findAll(teamId, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get check-in by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @User() user: any) {
    return this.checkInsService.findOne(id, user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update check-in' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: any,
    @Body() updateCheckInDto: UpdateCheckInDto,
  ) {
    return this.checkInsService.update(id, user.id, updateCheckInDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete check-in' })
  remove(@Param('id', ParseUUIDPipe) id: string, @User() user: any) {
    return this.checkInsService.remove(id, user.id);
  }
}
