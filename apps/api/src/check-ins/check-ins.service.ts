import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCheckInDto } from './dto/create-check-in.dto';
import { UpdateCheckInDto } from './dto/update-check-in.dto';

@Injectable()
export class CheckInsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createCheckInDto: CreateCheckInDto) {
    // Verify user is a team member
    const membership = await this.prisma.teamMembership.findFirst({
      where: {
        teamId: createCheckInDto.teamId,
        userId,
      },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this team');
    }

    // Check if check-in already exists for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingCheckIn = await this.prisma.checkIn.findFirst({
      where: {
        teamId: createCheckInDto.teamId,
        userId,
        createdAt: {
          gte: today,
        },
      },
    });

    if (existingCheckIn) {
      throw new ForbiddenException('Check-in already submitted for today');
    }

    return this.prisma.checkIn.create({
      data: {
        teamId: createCheckInDto.teamId,
        userId,
        today: createCheckInDto.today,
        yesterday: createCheckInDto.yesterday,
        blockers: createCheckInDto.blockers,
        mood: createCheckInDto.mood,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findAll(teamId: string, userId: string) {
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

    return this.prisma.checkIn.findMany({
      where: { teamId },
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

  async findOne(id: string, userId: string) {
    const checkIn = await this.prisma.checkIn.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!checkIn) {
      throw new NotFoundException(`Check-in with ID ${id} not found`);
    }

    // Verify user is a team member
    const membership = await this.prisma.teamMembership.findFirst({
      where: {
        teamId: checkIn.teamId,
        userId,
      },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this team');
    }

    return checkIn;
  }

  async update(id: string, userId: string, updateCheckInDto: UpdateCheckInDto) {
    const checkIn = await this.prisma.checkIn.findUnique({
      where: { id },
    });

    if (!checkIn) {
      throw new NotFoundException(`Check-in with ID ${id} not found`);
    }

    // Only the creator can update
    if (checkIn.userId !== userId) {
      throw new ForbiddenException('You can only update your own check-ins');
    }

    return this.prisma.checkIn.update({
      where: { id },
      data: updateCheckInDto,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    const checkIn = await this.prisma.checkIn.findUnique({
      where: { id },
    });

    if (!checkIn) {
      throw new NotFoundException(`Check-in with ID ${id} not found`);
    }

    // Only the creator can delete
    if (checkIn.userId !== userId) {
      throw new ForbiddenException('You can only delete your own check-ins');
    }

    return this.prisma.checkIn.delete({
      where: { id },
    });
  }
}
