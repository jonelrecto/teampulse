import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TeamRole } from '@prisma/client';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateTeamDto) {
    return this.prisma.$transaction(async (tx) => {
      const team = await tx.team.create({
        data: {
          name: dto.name,
          logoUrl: dto.logoUrl,
        },
      });

      await tx.teamMembership.create({
        data: {
          userId,
          teamId: team.id,
          role: TeamRole.ADMIN,
        },
      });

      return team;
    });
  }

  async findAll(userId: string) {
    const memberships = await this.prisma.teamMembership.findMany({
      where: { userId },
      include: {
        team: true,
      },
    });

    return memberships.map((m) => m.team);
  }

  async findOne(id: string, userId: string) {
    const membership = await this.prisma.teamMembership.findUnique({
      where: {
        userId_teamId: {
          userId,
          teamId: id,
        },
      },
      include: {
        team: true,
      },
    });

    if (!membership) {
      throw new NotFoundException('Team not found');
    }

    return membership.team;
  }

  async update(id: string, userId: string, dto: UpdateTeamDto) {
    const membership = await this.prisma.teamMembership.findUnique({
      where: {
        userId_teamId: {
          userId,
          teamId: id,
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('Team not found');
    }

    if (membership.role !== TeamRole.ADMIN) {
      throw new ForbiddenException('Only admins can update teams');
    }

    return this.prisma.team.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, userId: string) {
    const membership = await this.prisma.teamMembership.findUnique({
      where: {
        userId_teamId: {
          userId,
          teamId: id,
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('Team not found');
    }

    if (membership.role !== TeamRole.ADMIN) {
      throw new ForbiddenException('Only admins can delete teams');
    }

    await this.prisma.team.delete({
      where: { id },
    });

    return { message: 'Team deleted successfully' };
  }

  async regenerateInviteCode(id: string, userId: string) {
    const membership = await this.prisma.teamMembership.findUnique({
      where: {
        userId_teamId: {
          userId,
          teamId: id,
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('Team not found');
    }

    if (membership.role !== TeamRole.ADMIN) {
      throw new ForbiddenException('Only admins can regenerate invite codes');
    }

    return this.prisma.team.update({
      where: { id },
      data: {
        inviteCode: undefined, // Prisma will generate new cuid
      },
    });
  }

  async findByInviteCode(code: string) {
    const team = await this.prisma.team.findUnique({
      where: { inviteCode: code },
    });

    if (!team) {
      throw new NotFoundException('Invalid invite code');
    }

    return team;
  }

  async joinTeam(code: string, userId: string) {
    const team = await this.findByInviteCode(code);

    const existing = await this.prisma.teamMembership.findUnique({
      where: {
        userId_teamId: {
          userId,
          teamId: team.id,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('You are already a member of this team');
    }

    return this.prisma.teamMembership.create({
      data: {
        userId,
        teamId: team.id,
        role: TeamRole.MEMBER,
      },
      include: {
        team: true,
      },
    });
  }

  async getMembers(teamId: string, userId: string) {
    const membership = await this.prisma.teamMembership.findUnique({
      where: {
        userId_teamId: {
          userId,
          teamId,
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('Team not found');
    }

    return this.prisma.teamMembership.findMany({
      where: { teamId },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
            email: true,
          },
        },
      },
    });
  }

  async removeMember(teamId: string, memberUserId: string, adminUserId: string) {
    const adminMembership = await this.prisma.teamMembership.findUnique({
      where: {
        userId_teamId: {
          userId: adminUserId,
          teamId,
        },
      },
    });

    if (!adminMembership || adminMembership.role !== TeamRole.ADMIN) {
      throw new ForbiddenException('Only admins can remove members');
    }

    if (adminMembership.userId === memberUserId) {
      throw new BadRequestException('Cannot remove yourself');
    }

    await this.prisma.teamMembership.delete({
      where: {
        userId_teamId: {
          userId: memberUserId,
          teamId,
        },
      },
    });

    return { message: 'Member removed successfully' };
  }

  async transferAdmin(teamId: string, newAdminUserId: string, currentAdminUserId: string) {
    const currentAdmin = await this.prisma.teamMembership.findUnique({
      where: {
        userId_teamId: {
          userId: currentAdminUserId,
          teamId,
        },
      },
    });

    if (!currentAdmin || currentAdmin.role !== TeamRole.ADMIN) {
      throw new ForbiddenException('Only admins can transfer admin role');
    }

    return this.prisma.$transaction([
      this.prisma.teamMembership.update({
        where: {
          userId_teamId: {
            userId: currentAdminUserId,
            teamId,
          },
        },
        data: { role: TeamRole.MEMBER },
      }),
      this.prisma.teamMembership.update({
        where: {
          userId_teamId: {
            userId: newAdminUserId,
            teamId,
          },
        },
        data: { role: TeamRole.ADMIN },
      }),
    ]);
  }
}
