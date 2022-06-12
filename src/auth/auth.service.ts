import { Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { AuthDto } from './dtos';
import { TokenType } from './types';

@Injectable()
export class AuthService {
  constructor(private supabase: SupabaseClient) {}

  async signIn(authDto: AuthDto): Promise<TokenType> {
    const { session, error } = await this.supabase.auth.signIn({ ...authDto });

    if (error || !session?.access_token) {
      throw new Error(`user with email ${authDto.email} was unable to sign in`);
    }

    return {
      accessToken: session.access_token,
    };
  }
}
