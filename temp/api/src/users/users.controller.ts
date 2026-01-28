import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { createClient } from '@supabase/supabase-js';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  private supabase;

  constructor(private usersService: UsersService) {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  async getMe(@CurrentUser() user: any) {
    const dbUser = await this.usersService.findBySupabaseId(user.supabaseId);
    return this.usersService.findById(dbUser.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'User profile updated' })
  async updateMe(@CurrentUser() user: any, @Body() dto: UpdateUserDto) {
    const dbUser = await this.usersService.findBySupabaseId(user.supabaseId);
    return this.usersService.updateProfile(dbUser.id, dto);
  }

  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiResponse({ status: 200, description: 'Avatar uploaded' })
  async uploadAvatar(@CurrentUser() user: any, @UploadedFile() file: Express.Multer.File) {
    const dbUser = await this.usersService.findBySupabaseId(user.supabaseId);

    // Upload to Supabase Storage
    const fileName = `${dbUser.id}-${Date.now()}-${file.originalname}`;
    const { data, error } = await this.supabase.storage
      .from('avatars')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw new Error('Failed to upload avatar');
    }

    const {
      data: { publicUrl },
    } = this.supabase.storage.from('avatars').getPublicUrl(fileName);

    return this.usersService.updateAvatar(dbUser.id, publicUrl);
  }
}
