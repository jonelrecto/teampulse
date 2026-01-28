import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DigestFrequency } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, unreadOnly: boolean = false) {
    const where: any = { userId };
    if (unreadOnly) {
      where.readAt = null;
    }

    return this.prisma.notification.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async markAsRead(userId: string, notificationId: string) {
    return this.prisma.notification.update({
      where: {
        id: notificationId,
        userId, // Ensure user owns the notification
      },
      data: {
        readAt: new Date(),
      },
    });
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: {
        userId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    return { message: 'All notifications marked as read' };
  }

  async getPreferences(userId: string) {
    return this.prisma.notificationPreference.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    });
  }

  async updatePreferences(
    userId: string,
    teamId: string,
    data: {
      reminderEnabled?: boolean;
      reminderTime?: string;
      digestFrequency?: DigestFrequency;
    },
  ) {
    return this.prisma.notificationPreference.upsert({
      where: {
        userId_teamId: {
          userId,
          teamId,
        },
      },
      create: {
        userId,
        teamId,
        reminderEnabled: data.reminderEnabled ?? true,
        reminderTime: data.reminderTime ?? '09:00',
        digestFrequency: data.digestFrequency ?? DigestFrequency.DAILY,
      },
      update: data,
    });
  }

  async create(userId: string, type: string, title: string, body: string) {
    return this.prisma.notification.create({
      data: {
        userId,
        type,
        title,
        body,
      },
    });
  }
}
