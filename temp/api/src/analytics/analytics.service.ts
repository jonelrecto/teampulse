import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Mood } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getParticipation(teamId: string, userId: string, days: number = 7) {
    await this.verifyMembership(teamId, userId);

    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);

    const [totalMembers, checkIns] = await Promise.all([
      this.prisma.teamMembership.count({
        where: { teamId },
      }),
      this.prisma.checkIn.findMany({
        where: {
          teamId,
          checkInDate: { gte: dateFrom },
        },
        select: {
          userId: true,
          checkInDate: true,
        },
      }),
    ]);

    const uniqueUsers = new Set(checkIns.map((c) => c.userId));
    const participationRate = totalMembers > 0 ? (uniqueUsers.size / totalMembers) * 100 : 0;

    // Calculate trend (compare first half vs second half)
    const midpoint = Math.floor(days / 2);
    const firstHalf = checkIns.filter(
      (c) => c.checkInDate >= new Date(dateFrom.getTime() + midpoint * 24 * 60 * 60 * 1000),
    );
    const secondHalf = checkIns.filter(
      (c) => c.checkInDate < new Date(dateFrom.getTime() + midpoint * 24 * 60 * 60 * 1000),
    );

    const firstHalfUsers = new Set(firstHalf.map((c) => c.userId)).size;
    const secondHalfUsers = new Set(secondHalf.map((c) => c.userId)).size;
    const trend = secondHalfUsers > firstHalfUsers ? 'up' : secondHalfUsers < firstHalfUsers ? 'down' : 'stable';

    return {
      participationRate: Math.round(participationRate * 100) / 100,
      totalMembers,
      activeMembers: uniqueUsers.size,
      trend,
    };
  }

  async getMoodAnalytics(teamId: string, userId: string, days: number = 7) {
    await this.verifyMembership(teamId, userId);

    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);

    const checkIns = await this.prisma.checkIn.findMany({
      where: {
        teamId,
        checkInDate: { gte: dateFrom },
      },
      select: {
        mood: true,
        checkInDate: true,
      },
      orderBy: {
        checkInDate: 'asc',
      },
    });

    // Group by date and calculate average mood
    const moodValues = { GREAT: 5, GOOD: 4, OKAY: 3, LOW: 2, STRUGGLING: 1 };
    const byDate: Record<string, number[]> = {};

    checkIns.forEach((checkIn) => {
      const dateKey = checkIn.checkInDate.toISOString().split('T')[0];
      if (!byDate[dateKey]) {
        byDate[dateKey] = [];
      }
      byDate[dateKey].push(moodValues[checkIn.mood]);
    });

    const averages = Object.entries(byDate).map(([date, values]) => ({
      date,
      average: values.reduce((a, b) => a + b, 0) / values.length,
    }));

    return averages;
  }

  async getEnergyAnalytics(teamId: string, userId: string, days: number = 7) {
    await this.verifyMembership(teamId, userId);

    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);

    const checkIns = await this.prisma.checkIn.findMany({
      where: {
        teamId,
        checkInDate: { gte: dateFrom },
      },
      select: {
        energy: true,
        checkInDate: true,
      },
      orderBy: {
        checkInDate: 'asc',
      },
    });

    // Group by date and calculate average energy
    const byDate: Record<string, number[]> = {};

    checkIns.forEach((checkIn) => {
      const dateKey = checkIn.checkInDate.toISOString().split('T')[0];
      if (!byDate[dateKey]) {
        byDate[dateKey] = [];
      }
      byDate[dateKey].push(checkIn.energy);
    });

    const averages = Object.entries(byDate).map(([date, values]) => ({
      date,
      average: values.reduce((a, b) => a + b, 0) / values.length,
    }));

    return averages;
  }

  async getBlockers(teamId: string, userId: string) {
    await this.verifyMembership(teamId, userId);

    const checkIns = await this.prisma.checkIn.findMany({
      where: {
        teamId,
        blockers: { not: null },
      },
      select: {
        blockers: true,
        checkInDate: true,
      },
    });

    // Extract keywords from blockers
    const wordCount: Record<string, number> = {};
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can']);

    checkIns.forEach((checkIn) => {
      if (checkIn.blockers) {
        const words = checkIn.blockers
          .toLowerCase()
          .replace(/[^\w\s]/g, ' ')
          .split(/\s+/)
          .filter((w) => w.length > 3 && !stopWords.has(w));

        words.forEach((word) => {
          wordCount[word] = (wordCount[word] || 0) + 1;
        });
      }
    });

    const sorted = Object.entries(wordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([word, count]) => ({ word, count }));

    return sorted;
  }

  async getStreaks(teamId: string, userId: string) {
    await this.verifyMembership(teamId, userId);

    const members = await this.prisma.teamMembership.findMany({
      where: { teamId },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    const streaks = await Promise.all(
      members.map(async (member) => {
        const checkIns = await this.prisma.checkIn.findMany({
          where: {
            teamId,
            userId: member.userId,
          },
          select: {
            checkInDate: true,
          },
          orderBy: {
            checkInDate: 'desc',
          },
        });

        if (checkIns.length === 0) {
          return {
            user: member.user,
            streak: 0,
          };
        }

        // Calculate current streak
        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < checkIns.length; i++) {
          const checkInDate = new Date(checkIns[i].checkInDate);
          checkInDate.setHours(0, 0, 0, 0);

          const expectedDate = new Date(today);
          expectedDate.setDate(today.getDate() - i);

          if (checkInDate.getTime() === expectedDate.getTime()) {
            streak++;
          } else {
            break;
          }
        }

        return {
          user: member.user,
          streak,
        };
      }),
    );

    return streaks.sort((a, b) => b.streak - a.streak);
  }

  async exportCheckIns(teamId: string, userId: string) {
    await this.verifyMembership(teamId, userId);

    const checkIns = await this.prisma.checkIn.findMany({
      where: { teamId },
      include: {
        user: {
          select: {
            displayName: true,
            email: true,
          },
        },
      },
      orderBy: {
        checkInDate: 'desc',
      },
    });

    // Convert to CSV
    const headers = ['Date', 'User', 'Email', 'Yesterday', 'Today', 'Blockers', 'Mood', 'Energy'];
    const rows = checkIns.map((checkIn) => [
      checkIn.checkInDate.toISOString().split('T')[0],
      checkIn.user.displayName,
      checkIn.user.email,
      `"${checkIn.yesterday.replace(/"/g, '""')}"`,
      `"${checkIn.today.replace(/"/g, '""')}"`,
      checkIn.blockers ? `"${checkIn.blockers.replace(/"/g, '""')}"` : '',
      checkIn.mood,
      checkIn.energy.toString(),
    ]);

    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    return csv;
  }

  private async verifyMembership(teamId: string, userId: string) {
    const membership = await this.prisma.teamMembership.findUnique({
      where: {
        userId_teamId: {
          userId,
          teamId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this team');
    }
  }
}
