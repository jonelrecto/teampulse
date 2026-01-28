import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOrCreateUser(data: {
    supabaseId: string;
    email: string;
    displayName: string;
    avatarUrl?: string;
  }) {
    let user = await this.prisma.user.findUnique({
      where: { supabaseId: data.supabaseId },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          supabaseId: data.supabaseId,
          email: data.email,
          displayName: data.displayName,
          avatarUrl: data.avatarUrl,
        },
      });
    } else if (data.avatarUrl || data.displayName !== user.displayName) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          displayName: data.displayName,
          avatarUrl: data.avatarUrl || user.avatarUrl,
        },
      });
    }

    return user;
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        timezone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findBySupabaseId(supabaseId: string) {
    const user = await this.prisma.user.findUnique({
      where: { supabaseId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, data: { displayName?: string; timezone?: string }) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        timezone: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateAvatar(userId: string, avatarUrl: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        timezone: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
