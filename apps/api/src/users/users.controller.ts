import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { createClient } from '@supabase/supabase-js';

@ApiTags('users')
@Controller('users')
export class UsersController {
  private supabase;

  constructor(private usersService: UsersService) {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create user record in database' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  async getMe(@CurrentUser() user: any) {
    console.log('me here');

    const userData = await this.usersService.findBySupabaseId(user.id);
    console.log('userData', userData);
    return { ...user, ...userData };
  }

  @Post('me/avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload current user avatar' })
  @ApiResponse({ status: 200, description: 'Avatar uploaded' })
  async uploadMyAvatar(
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file type
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only images are allowed.');
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('File size must be less than 5MB');
    }

    const fileName = `${user.id}-${Date.now()}.${file.originalname.split('.').pop()}`;
    
    // Upload to Supabase Storage
    const { data, error } = await this.supabase.storage
      .from('avatars')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw new BadRequestException('Failed to upload avatar');
    }

    const {
      data: { publicUrl },
    } = this.supabase.storage.from('avatars').getPublicUrl(fileName);

    // Update user avatar in database
    return this.usersService.updateAvatar(user.id, publicUrl);
  }

  @Patch(':id/avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload/update user avatar by ID' })
  @ApiResponse({ status: 200, description: 'Avatar uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async uploadAvatar(
    @Param('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file type
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only images are allowed.');
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('File size must be less than 5MB');
    }

    const fileName = `${userId}-${Date.now()}.${file.originalname.split('.').pop()}`;

    // Upload to Supabase Storage
    const { data, error } = await this.supabase.storage
      .from('avatars')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw new BadRequestException('Failed to upload avatar');
    }

    const {
      data: { publicUrl },
    } = this.supabase.storage.from('avatars').getPublicUrl(fileName);

    // Update user avatar in database
    return this.usersService.updateAvatar(userId, publicUrl);
  }
}