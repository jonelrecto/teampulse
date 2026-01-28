import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { TeamRole } from '@prisma/client';

@Injectable()
export class TeamAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const membership = request.teamMembership;

    if (!membership || membership.role !== TeamRole.ADMIN) {
      throw new ForbiddenException('Only team admins can perform this action');
    }

    return true;
  }
}
