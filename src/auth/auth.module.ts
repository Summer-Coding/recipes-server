import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { PrismaClient } from '@prisma/client';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SupabaseConfig } from '../environment/supabase.config';
import { SupabaseAuthGuard } from './guards';
import { SupabaseStrategy } from './strategies';

const options = {
  persistSession: false,
  detectSessionInUrl: false,
};

@Module({
  imports: [ConfigModule, PassportModule],
  providers: [
    AuthService,
    PrismaClient,
    SupabaseStrategy,
    {
      provide: SupabaseClient,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const supabaseConfig =
          configService.getOrThrow<SupabaseConfig>('supabase');
        return createClient(
          supabaseConfig.url,
          supabaseConfig.privateKey,
          options,
        );
      },
    },
    {
      provide: APP_GUARD,
      useClass: SupabaseAuthGuard,
    },
  ],
  controllers: [AuthController],
  exports: [AuthService, SupabaseStrategy],
})
export class AuthModule {}
