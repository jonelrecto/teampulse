import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  private supabase;

  constructor(private usersService: UsersService) {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );
  }

  async validateUser(token: string) {
    try {
      const {
        data: { user },
        error,
      } = await this.supabase.auth.getUser(token);

      if (error || !user) {
        throw new UnauthorizedException('Invalid token');
      }

      // Ensure user exists in our database
      const dbUser = await this.usersService.findOrCreateUser({
        supabaseId: user.id,
        email: user.email!,
        displayName: user.user_metadata?.display_name || user.email!.split('@')[0],
        avatarUrl: user.user_metadata?.avatar_url,
      });

      return dbUser;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
