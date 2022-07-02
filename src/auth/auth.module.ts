import { Global, Module } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SupabaseStrategy } from './strategies/supabase.strategy';
import { PassportModule } from '@nestjs/passport';
import { APP_GUARD } from '@nestjs/core';
import { SupabaseAuthGuard } from './guards/supabase.guard';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SupabaseConfig } from '../environment';
import { PrismaClient } from '@prisma/client';

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
