import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  private supabase;

  constructor(private prisma: PrismaService) {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );
  }

  async validateUser(token: string) {
    const {
      data: { user },
      error,
    } = await this.supabase.auth.getUser(token);

    if (error || !user) {
      throw new UnauthorizedException('Invalid token');
    }

    // Ensure user exists in database
    let dbUser = await this.prisma.users.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      dbUser = await this.prisma.users.create({
        data: {
          id: user.id,
          email: user.email,
          displayName: user.user_metadata?.displayName || user.email?.split('@')[0],
          supabaseId: crypto.randomUUID(),
          updatedAt: new Date()
        },
      });
    }

    return dbUser;
  }

  async getCurrentUser(userId: string) {
    return this.prisma.users.findUnique({
      where: { id: userId },
    });
  }
}
