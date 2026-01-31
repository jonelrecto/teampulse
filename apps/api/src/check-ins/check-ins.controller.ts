import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ParseUUIDPipe,
  BadRequestException,
  Patch
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiResponse } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CheckInsService } from './check-ins.service';
import { CreateCheckInDto } from './dto/create-check-in.dto';
import { UpdateCheckInDto } from './dto/update-check-in.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TeamMemberGuard } from '../teams/guards/team-member.guard';
import { TeamAdminGuard } from '../teams/guards/team-admin.guard';
import { User } from '../common/decorators/user.decorator';
import { createClient } from '@supabase/supabase-js';

@ApiTags('check-ins')
@Controller('check-ins')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CheckInsController {
  private supabase;

  constructor(private readonly checkInsService: CheckInsService) {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );
  }

  @Post(':teamId')
  @ApiOperation({ summary: 'Create a new check-in' })
  create(
    @User() user: any, 
    @Body() createCheckInDto: CreateCheckInDto) 
  {
    return this.checkInsService.create(user.id, createCheckInDto);
  }

  @Post(':teamId/:checkInId/attachments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload check-in attachment' })
  @ApiResponse({ status: 200, description: 'File Uploaded' })
  async uploadMyAvatar(
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @Param('checkInId', ParseUUIDPipe) checkInId: string,
    @User() user: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file type (images only)
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only images are allowed.');
    }
    
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('File size must be less than 5MB');
    }

    const fileName = `${checkInId}-${Date.now()}.${file.originalname.split('.').pop()}`;
    
    // Upload to Supabase Storage
    const { data, error } = await this.supabase.storage
      .from('attachments')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw new BadRequestException('Failed to upload attachment');
    }

    const {
      data: { publicUrl },
    } = this.supabase.storage.from('attachments').getPublicUrl(fileName);

    // Update user avatar in database
    return this.checkInsService.attach(checkInId, user.id, publicUrl, fileName);
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

  @Patch(':checkInId')
  @ApiOperation({ summary: 'Update check-in' })
  update(
    @Param('checkInId', ParseUUIDPipe) checkInId: string,
    @User() user: any,
    @Body() updateCheckInDto: UpdateCheckInDto,
  ) {
    return this.checkInsService.update(checkInId, user.id, updateCheckInDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete check-in' })
  remove(@Param('id', ParseUUIDPipe) id: string, @User() user: any) {
    return this.checkInsService.remove(id, user.id);
  }
}
