import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCheckInDto } from './dto/create-check-in.dto';
import { UpdateCheckInDto } from './dto/update-check-in.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class CheckInsService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  async create(teamId: string, userId: string, dto: CreateCheckInDto) {
    // Verify user is team member
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

    // Get user timezone
    const user = await this.usersService.findById(userId);
    const checkInDate = dto.checkInDate
      ? new Date(dto.checkInDate)
      : this.getUserLocalDate(user.timezone);

    // Check if check-in already exists for this date
    const existing = await this.prisma.checkIn.findUnique({
      where: {
        userId_teamId_checkInDate: {
          userId,
          teamId,
          checkInDate,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Check-in already exists for this date');
    }

    return this.prisma.checkIn.create({
      data: {
        userId,
        teamId,
        yesterday: dto.yesterday,
        today: dto.today,
        blockers: dto.blockers,
        mood: dto.mood,
        energy: dto.energy,
        checkInDate,
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        attachments: true,
      },
    });
  }

  async findAll(
    teamId: string,
    userId: string,
    filters: {
      dateFrom?: string;
      dateTo?: string;
      userIds?: string[];
      hasBlockers?: boolean;
      page?: number;
      limit?: number;
    },
  ) {
    // Verify user is team member
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

    const where: any = {
      teamId,
    };

    if (filters.dateFrom || filters.dateTo) {
      where.checkInDate = {};
      if (filters.dateFrom) {
        where.checkInDate.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        where.checkInDate.lte = new Date(filters.dateTo);
      }
    }

    if (filters.userIds && filters.userIds.length > 0) {
      where.userId = { in: filters.userIds };
    }

    if (filters.hasBlockers !== undefined) {
      if (filters.hasBlockers) {
        where.blockers = { not: null };
      } else {
        where.blockers = null;
      }
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const [checkIns, total] = await Promise.all([
      this.prisma.checkIn.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              avatarUrl: true,
            },
          },
          attachments: true,
        },
        orderBy: {
          checkInDate: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.checkIn.count({ where }),
    ]);

    return {
      data: checkIns,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findToday(teamId: string, userId: string) {
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

    const user = await this.usersService.findById(userId);
    const today = this.getUserLocalDate(user.timezone);

    return this.prisma.checkIn.findUnique({
      where: {
        userId_teamId_checkInDate: {
          userId,
          teamId,
          checkInDate: today,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        attachments: true,
      },
    });
  }

  async update(teamId: string, checkInId: string, userId: string, dto: UpdateCheckInDto) {
    const checkIn = await this.prisma.checkIn.findUnique({
      where: { id: checkInId },
    });

    if (!checkIn) {
      throw new NotFoundException('Check-in not found');
    }

    if (checkIn.userId !== userId) {
      throw new ForbiddenException('You can only update your own check-ins');
    }

    if (checkIn.teamId !== teamId) {
      throw new ForbiddenException('Check-in does not belong to this team');
    }

    // Check if still within same day (user's timezone)
    const user = await this.usersService.findById(userId);
    const today = this.getUserLocalDate(user.timezone);
    if (checkIn.checkInDate.getTime() !== today.getTime()) {
      throw new BadRequestException('Can only edit check-ins from today');
    }

    return this.prisma.checkIn.update({
      where: { id: checkInId },
      data: dto,
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        attachments: true,
      },
    });
  }

  async addAttachment(
    teamId: string,
    checkInId: string,
    userId: string,
    file: Express.Multer.File,
    url: string,
    storagePath: string,
  ) {
    const checkIn = await this.prisma.checkIn.findUnique({
      where: { id: checkInId },
      include: { attachments: true },
    });

    if (!checkIn) {
      throw new NotFoundException('Check-in not found');
    }

    if (checkIn.userId !== userId) {
      throw new ForbiddenException('You can only add attachments to your own check-ins');
    }

    if (checkIn.teamId !== teamId) {
      throw new ForbiddenException('Check-in does not belong to this team');
    }

    if (checkIn.attachments.length >= 3) {
      throw new BadRequestException('Maximum 3 attachments allowed');
    }

    return this.prisma.checkInAttachment.create({
      data: {
        checkInId,
        url,
        filename: file.originalname,
        storagePath,
      },
    });
  }

  private getUserLocalDate(timezone: string): Date {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-CA', { timeZone: timezone }); // YYYY-MM-DD
    return new Date(dateStr + 'T00:00:00');
  }
}
