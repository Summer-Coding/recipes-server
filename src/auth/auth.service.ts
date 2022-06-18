import { Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { UserService } from '../user/user.service';
import { AuthDto, DevAuthDto } from './dtos';
import { TokenType } from './types';

@Injectable()
export class AuthService {
  constructor(
    private supabase: SupabaseClient,
    private userService: UserService,
  ) {}

  async signIn(authDto: DevAuthDto): Promise<TokenType> {
    const { session, error } = await this.supabase.auth.signIn({ ...authDto });

    if (error || !session?.access_token) {
      throw new Error(`user with email ${authDto.email} was unable to sign in`);
    }

    return {
      accessToken: session.access_token,
    };
  }

  async signUp(authDto: AuthDto): Promise<void> {
    const { user, error } = await this.supabase.auth.api.createUser({
      email: authDto.email,
      user_metadata: {
        roles: ['USER'],
      },
    });

    if (error || !user?.id) {
      throw new Error(`User with email ${authDto.email} was unable to sign up`);
    }

    this.userService.createIfNotExists({
      id: user.id,
      email: authDto.email,
    });
  }

  async setUsername(userId: string, username: string): Promise<void> {
    await this.supabase.auth.api.updateUserById(userId, {
      user_metadata: {
        username,
      },
    });
  }
}
