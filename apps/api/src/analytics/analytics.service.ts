import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getTeamStats(teamId: string, userId: string) {
    // Verify user is a team member
    const membership = await this.prisma.teamMembership.findFirst({
      where: {
        teamId,
        userId,
      },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this team');
    }

    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        memberships: true,
        checkIns: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
              },
            },
          },
        },
      },
    });

    if (!team) {
      throw new ForbiddenException('Team not found');
    }

    const totalMembers = team.memberships.length;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayCheckIns = team.checkIns.filter(
      (ci) => new Date(ci.createdAt) >= today,
    );

    const participationRate = totalMembers > 0 
      ? (todayCheckIns.length / totalMembers) * 100 
      : 0;

    // Mood distribution
    const moodCounts = {
      GREAT: 0,
      GOOD: 0,
      OKAY: 0,
      BAD: 0,
      TERRIBLE: 0,
    };

    todayCheckIns.forEach((ci) => {
      moodCounts[ci.mood] = (moodCounts[ci.mood] || 0) + 1;
    });

    // Weekly participation
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklyCheckIns = team.checkIns.filter(
      (ci) => new Date(ci.createdAt) >= weekAgo,
    );

    return {
      team: {
        id: team.id,
        name: team.name,
      },
      stats: {
        totalMembers,
        activeMembers: todayCheckIns.length,
        participationRate: Math.round(participationRate * 100) / 100,
        moodDistribution: moodCounts,
        weeklyCheckIns: weeklyCheckIns.length,
        todayCheckIns: todayCheckIns.length,
      },
      recentCheckIns: todayCheckIns.slice(0, 10),
    };
  }

  async getTeamCheckIns(teamId: string, userId: string, days: number = 7) {
    // Verify user is a team member
    const membership = await this.prisma.teamMembership.findFirst({
      where: {
        teamId,
        userId,
      },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this team');
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.prisma.checkIn.findMany({
      where: {
        teamId,
        createdAt: {
          gte: startDate,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
