import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { randomInt, randomUUID } from 'crypto';

@Injectable()
export class TeamsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createTeamDto: CreateTeamDto) {
    // First, verify that the user exists
    const user = await this.prisma.users.findUnique({
      where: { supabaseId: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found. Please log in again.');
    }

    // Generate a unique 6-digit invite code
    const inviteCode = Math.floor(100000 + Math.random() * 900000).toString();

    const team = await this.prisma.team.create({
      data: {
        id: randomUUID(),
        name: createTeamDto.name,
        inviteCode: inviteCode,
        updatedAt: new Date(),
        TeamMembership: {
          create: {
            id: randomUUID(),
            userId: user.id,
            role: 'ADMIN',
          },
        },
      },
      include: {
        TeamMembership: {
          include: {
            Users: {
              select: {
                id: true,
                email: true,
                displayName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    return team;
  }

  async findAll(userId: string) {
    console.log('userid', userId);
    const team = await this.prisma.team.findMany({
      where: {
        TeamMembership: {
          some: {
            userId,
          },
        },
      },
      // include: {
      //   TeamMembership: {
      //     include: {
      //       Users: {
      //         select: {
      //           id: true,
      //           email: true,
      //           displayName: true,
      //           avatarUrl: true,
      //         },
      //       },
      //     },
      //   },
      //   _count: {
      //     select: {
      //       CheckIn: true,
      //     },
      //   },
      // },
    });

    console.log('team here', team);
    return team;
  }

  async findOne(id: string, userId: string) {
    const team = await this.prisma.team.findUnique({
      where: { id },
      include: {
        TeamMembership: {
          include: {
            Users: {
              select: {
                id: true,
                email: true,
                displayName: true,
                avatarUrl: true,
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
    const isMember = team.TeamMembership.some((m) => m.userId === userId);
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
      data: {
        ...updateTeamDto,
        updatedAt: new Date(),
      },
      include: {
        TeamMembership: {
          include: {
            Users: {
              select: {
                id: true,
                email: true,
                displayName: true,
                avatarUrl: true,
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