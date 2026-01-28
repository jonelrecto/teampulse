import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CheckInsService } from './check-ins.service';
import { CreateCheckInDto } from './dto/create-check-in.dto';
import { UpdateCheckInDto } from './dto/update-check-in.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TeamMemberGuard } from '../teams/guards/team-member.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import { createClient } from '@supabase/supabase-js';

@ApiTags('check-ins')
@ApiBearerAuth()
@Controller('teams/:teamId/check-ins')
@UseGuards(JwtAuthGuard, TeamMemberGuard)
export class CheckInsController {
  private supabase;

  constructor(private checkInsService: CheckInsService) {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create a check-in' })
  @ApiResponse({ status: 201, description: 'Check-in created' })
  async create(
    @Param('teamId') teamId: string,
    @CurrentUser() user: any,
    @Body() dto: CreateCheckInDto,
  ) {
    return this.checkInsService.create(teamId, user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all check-ins for a team' })
  @ApiQuery({ name: 'dateFrom', required: false })
  @ApiQuery({ name: 'dateTo', required: false })
  @ApiQuery({ name: 'userIds', required: false, type: [String] })
  @ApiQuery({ name: 'hasBlockers', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Check-ins retrieved' })
  async findAll(
    @Param('teamId') teamId: string,
    @CurrentUser() user: any,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('userIds') userIds?: string,
    @Query('hasBlockers') hasBlockers?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.checkInsService.findAll(teamId, user.userId, {
      dateFrom,
      dateTo,
      userIds: userIds ? userIds.split(',') : undefined,
      hasBlockers: hasBlockers === 'true' ? true : hasBlockers === 'false' ? false : undefined,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get('mine/today')
  @ApiOperation({ summary: 'Get current user\'s check-in for today' })
  @ApiResponse({ status: 200, description: 'Check-in retrieved' })
  async findToday(@Param('teamId') teamId: string, @CurrentUser() user: any) {
    return this.checkInsService.findToday(teamId, user.userId);
  }

  @Patch(':checkInId')
  @ApiOperation({ summary: 'Update a check-in' })
  @ApiResponse({ status: 200, description: 'Check-in updated' })
  async update(
    @Param('teamId') teamId: string,
    @Param('checkInId') checkInId: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateCheckInDto,
  ) {
    return this.checkInsService.update(teamId, checkInId, user.userId, dto);
  }

  @Post(':checkInId/attachments')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload attachment to check-in' })
  @ApiResponse({ status: 201, description: 'Attachment uploaded' })
  async addAttachment(
    @Param('teamId') teamId: string,
    @Param('checkInId') checkInId: string,
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // Upload to Supabase Storage
    const fileName = `${checkInId}-${Date.now()}-${file.originalname}`;
    const { data, error } = await this.supabase.storage
      .from('attachments')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw new Error('Failed to upload attachment');
    }

    // Generate signed URL (1 hour expiration)
    const {
      data: { signedUrl },
    } = await this.supabase.storage.from('attachments').createSignedUrl(fileName, 3600);

    return this.checkInsService.addAttachment(teamId, checkInId, user.userId, file, signedUrl, fileName);
  }
}
