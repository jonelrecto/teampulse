import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TeamAdminGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const teamId = request.params.teamId || request.body.teamId;

    if (!teamId) {
      throw new ForbiddenException('Team ID is required');
    }

    const membership = await this.prisma.teamMembership.findFirst({
      where: {
        teamId,
        userId: user.id,
        role: 'ADMIN',
      },
    });

    if (!membership) {
      throw new ForbiddenException('You must be an admin of this team');
    }

    request.teamMembership = membership;
    return true;
  }
}
