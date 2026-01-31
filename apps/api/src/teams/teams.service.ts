import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { randomInt, randomUUID } from 'crypto';
import { TeamAdminGuard } from './guards/team-admin.guard';
import { userInfo } from 'os';
import { User } from '@/common/decorators/user.decorator';

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
    const team = await this.prisma.team.findMany({
      where: {
        TeamMembership: {
          some: {
            userId,
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
        _count: {
          select: {
            CheckIn: true,
          },
        },
      },
    });

    console.log('team here', team);
    return team;
  }

  async findOne(id: string, userId: string) {
    const team = await this.prisma.team.findUnique({
      where: { id },
      include: {
        TeamMembership: {
          where: {
            userId, // 👈 only YOUR membership
          },
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
  
    // If no membership, user is not part of the team
    if (team.TeamMembership.length === 0) {
      throw new ForbiddenException('You are not a member of this team');
    }
  
    // 👇 Convert array → object
    const myMembership = team.TeamMembership[0];
  
    return {
      ...team,
      TeamMembership: myMembership,
    };
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

  async regenerate(teamId: string, userId: string) {
    // Verify user is admin
    const membership = await this.prisma.teamMembership.findFirst({
      where: {
        teamId,
        userId,
        role: 'ADMIN',
      },
    });
  
    if (!membership) {
      throw new ForbiddenException('You must be an admin to regenerate invite code');
    }
  
    // Generate new 6-digit code
    const inviteCode = Math.floor(100000 + Math.random() * 900000).toString();
  
    return this.prisma.team.update({
      where: { id: teamId },
      data: {
        inviteCode,
        updatedAt: new Date(),
      },
    });
  }

  async getTeamByCode(code: string) {
    return await this.prisma.team.findFirst({
      where: { inviteCode: code }
    });

  }

  async joinTeam(code: string, userId: string) {
    // Verify team exists
    const team = await this.getTeamByCode(code);
  
    // Check if already a member
    const existingMembership = await this.prisma.teamMembership.findUnique({
      where: {
        userId_teamId: {
          userId,
          teamId: team.id,
        },
      },
    });
  
    if (existingMembership) {
      throw new BadRequestException('You are already a member of this team');
    }
  
    // Create membership
    const membership = await this.prisma.teamMembership.create({
      data: {
        id: randomUUID(),
        userId,
        teamId: team.id,
        role: 'MEMBER',
      },
      include: {
        Team: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
          },
        },
      },
    });
  
    return {
      message: 'Successfully joined team',
      team: membership.Team,
      membership: {
        id: membership.id,
        role: membership.role,
        joinedAt: membership.joinedAt,
      },
    };
  }

  async teamCheckins(id: string, user: any) {
    return await this.prisma.checkIn.findMany({
      where: { teamId : id },
      include: {
        Users: {
          select: {
            id: true,
            displayName: true
          }
        }
      }
    })
  }

  async teamMembers(id: string) {
    return await this.prisma.teamMembership.findMany({
      where: { teamId: id},
      include: {
        Users: {
          select: {
            id: true,
            displayName: true,
            email: true,
            avatarUrl: true
          }
        }
      }
    })
  }

  async removeMember(teamId: string, targetUserId: string, adminUserId: string) {
    // ❌ Prevent removing yourself
    if (targetUserId === adminUserId) {
      throw new BadRequestException('You cannot remove yourself from the team');
    }
  
    // ✅ Ensure admin is actually admin (extra safety)
    const adminMembership = await this.prisma.teamMembership.findFirst({
      where: {
        teamId,
        userId: adminUserId,
        role: 'ADMIN',
      },
    });
  
    if (!adminMembership) {
      throw new ForbiddenException('Only admins can remove members');
    }
  
    // ✅ Ensure target user is a member of this team
    const member = await this.prisma.teamMembership.findUnique({
      where: {
        userId_teamId: {
          userId: targetUserId,
          teamId,
        },
      },
    });
  
    if (!member) {
      throw new NotFoundException('User is not a member of this team');
    }
  
    // ✅ Remove membership
    await this.prisma.teamMembership.delete({
      where: {
        userId_teamId: {
          userId: targetUserId,
          teamId,
        },
      },
    });
  
    return {
      message: 'Member removed successfully',
    };
  }
}