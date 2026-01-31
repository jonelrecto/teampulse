import { Injectable, NotFoundException, ForbiddenException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCheckInDto } from './dto/create-check-in.dto';
import { UpdateCheckInDto } from './dto/update-check-in.dto';
import { randomUUID } from 'crypto';

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
        checkInDate: today,
      },
    });

    if (existingCheckIn) {
      return {
        statusCode: 409,
        message: 'Check-in already summitted for today.',
        data: existingCheckIn
      }
    }

    return this.prisma.checkIn.create({
      data: {
        id: randomUUID(),
        teamId: createCheckInDto.teamId,
        userId: userId,
        today: createCheckInDto.today,
        yesterday: createCheckInDto.yesterday,
        blockers: createCheckInDto.blockers,
        mood: createCheckInDto.mood,
        energy: createCheckInDto.energy,
        checkInDate: today,
        updatedAt: new Date(),
      },
      include: {
        Users: {
          select: {
            id: true,
            email: true,
            displayName: true,
          },
        },
        Team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async attach(checkInId: string, userId: string, publicUrl: string, fileName: string) {
    // Verify the check-in exists
    const checkIn = await this.prisma.checkIn.findUnique({
      where: { id: checkInId },
      include: {
        CheckInAttachment: true,
      }
    });

    if (!checkIn) {
      throw new NotFoundException('Check-in not found.');
    }

    // Verify ownership
    if (checkIn.userId !== userId) {
      throw new ForbiddenException('You can only add attachments to your own check-ins');
    }

    if (checkIn.CheckInAttachment.length >= 3) {
      throw new BadRequestException('Maximum 3 attachment allowed per check-in');
    }

    return await this.prisma.checkInAttachment.create({
      data: {
        id: randomUUID(),
        checkInId: checkInId,
        url: publicUrl,
        filename: fileName,
        storagePath: fileName
      }
    })
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
        Users: {
          select: {
            id: true,
            email: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        checkInDate: 'desc',
      },
    });
  }

  async findOne(id: string, userId: string) {
    const checkIn = await this.prisma.checkIn.findUnique({
      where: { id },
      include: {
        Users: {
          select: {
            id: true,
            email: true,
            displayName: true,
          },
        },
        Team: {
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
      data: {
        ...updateCheckInDto,
        updatedAt: new Date(),
      },
      include: {
        Users: {
          select: {
            id: true,
            email: true,
            displayName: true,
          },
        },
        Team: {
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