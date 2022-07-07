import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { SupabaseClient } from '@supabase/supabase-js';
import { AuthDto, PasswordAuthDto } from './dtos';
import { WebConfig } from '../environment/web.config';
import { formatString } from '../stringUtils';
import { TokenType } from './types';

@Injectable()
export class AuthService {
  private signInErrorMessage = `user with email {0} was unable to sign in`;

  constructor(
    private supabase: SupabaseClient,
    private prisma: PrismaClient,
    private configService: ConfigService,
  ) {}

  async signInWithPassword(authDto: PasswordAuthDto): Promise<TokenType> {
    const { session, error } = await this.supabase.auth.signIn(
      { ...authDto },
      {
        shouldCreateUser: false,
      },
    );

    if (!!error || !session?.access_token) {
      throw new Error(
        formatString(this.signInErrorMessage, authDto.email as string),
      );
    }

    return {
      accessToken: session.access_token,
    };
  }

  async setUsername(userId: string, username: string): Promise<void> {
    await this.supabase.auth.api.updateUserById(userId, {
      user_metadata: {
        username,
      },
    });
  }

  async signInAndCreateIfNotExists(authDto: AuthDto): Promise<void> {
    const webConfig = this.configService.getOrThrow<WebConfig>('web');
    let redirectTo = webConfig.webUrl;

    const userCount = await this.prisma.user.count({
      where: {
        email: authDto.email,
      },
    });

    if (userCount === 0) {
      try {
        await this.signUp(authDto);
        redirectTo = `${redirectTo}/profile/`;
      } catch (err) {
        throw err;
      }
    }

    await this.signInWithMagicLink(authDto, redirectTo);
  }

  private async signUp(authDto: AuthDto): Promise<void> {
    const { error } = await this.supabase.auth.api.createUser({
      email: authDto.email,
      user_metadata: {
        roles: ['USER'],
      },
    });

    if (!!error) {
      throw new Error(formatString(this.signInErrorMessage, authDto.email));
    }
  }

  private async signInWithMagicLink(
    authDto: AuthDto,
    redirectTo: string,
  ): Promise<void> {
    const { error } = await this.supabase.auth.signIn(
      { ...authDto },
      {
        redirectTo,
        shouldCreateUser: false,
      },
    );

    if (!!error) {
      throw new Error(formatString(this.signInErrorMessage, authDto.email));
    }
  }
}
