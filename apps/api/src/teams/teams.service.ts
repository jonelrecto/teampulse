import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createTeamDto: CreateTeamDto) {
    const team = await this.prisma.team.create({
      data: {
        name: createTeamDto.name,
        description: createTeamDto.description,
        memberships: {
          create: {
            userId,
            role: 'ADMIN',
          },
        },
      },
      include: {
        memberships: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                displayName: true,
              },
            },
          },
        },
      },
    });

    return team;
  }

  async findAll(userId: string) {
    return this.prisma.team.findMany({
      where: {
        memberships: {
          some: {
            userId,
          },
        },
      },
      include: {
        memberships: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                displayName: true,
              },
            },
          },
        },
        _count: {
          select: {
            checkIns: true,
          },
        },
      },
    });
  }

  async findOne(id: string, userId: string) {
    const team = await this.prisma.team.findUnique({
      where: { id },
      include: {
        memberships: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                displayName: true,
              },
            },
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }

    // Check if user is a member
    const isMember = team.memberships.some((m) => m.userId === userId);
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this team');
    }

    return team;
  }

  async update(id: string, userId: string, updateTeamDto: UpdateTeamDto) {
    // Check if user is admin
    const membership = await this.prisma.teamMembership.findFirst({
      where: {
        teamId: id,
        userId,
        role: 'ADMIN',
      },
    });

    if (!membership) {
      throw new ForbiddenException('You must be an admin to update this team');
    }

    return this.prisma.team.update({
      where: { id },
      data: updateTeamDto,
      include: {
        memberships: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                displayName: true,
              },
            },
          },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    // Check if user is admin
    const membership = await this.prisma.teamMembership.findFirst({
      where: {
        teamId: id,
        userId,
        role: 'ADMIN',
      },
    });

    if (!membership) {
      throw new ForbiddenException('You must be an admin to delete this team');
    }

    return this.prisma.team.delete({
      where: { id },
    });
  }
}
