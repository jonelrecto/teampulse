import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    // Check if user already exists
    const existingUser = await this.prisma.users.findUnique({
      where: { supabaseId: createUserDto.supabaseId },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Create user in database
    return this.prisma.users.create({
      data: {
        id: createUserDto.supabaseId,
        supabaseId: createUserDto.supabaseId,
        email: createUserDto.email,
        displayName: createUserDto.displayName,
        avatarUrl: createUserDto.avatarUrl || null,
        timezone: timezone || 'America/New_York',
        updatedAt: new Date(),
      },
    });
  }

  async findBySupabaseId(supabaseId: string) {

    return this.prisma.users.findUnique({
      where: { supabaseId }
    });
  }

  async findById(userId: string) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, updateData: any) {
    return this.prisma.users.update({
      where: { id: userId },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
    });
  }

  async updateAvatar(userId: string, avatarUrl: string) {
    const user = await this.findById(userId);

    return this.prisma.users.update({
      where: { id: userId },
      data: {
        avatarUrl,
        updatedAt: new Date(),
      },
    });
  }
}