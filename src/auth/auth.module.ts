import { Module } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SupabaseStrategy } from './strategies/supabase.strategy';
import { PassportModule } from '@nestjs/passport';
import { APP_GUARD } from '@nestjs/core';
import { SupabaseAuthGuard } from './guards/supabase.guard';
import { ConfigService } from '@nestjs/config';
import { SupabaseConfig } from '../environment';

const options = {
  autoRefreshToken: true,
  persistSession: false,
  detectSessionInUrl: false,
};

@Module({
  imports: [PassportModule],
  providers: [
    AuthService,
    SupabaseStrategy,
    {
      provide: SupabaseClient,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const supabaseConfig =
          configService.getOrThrow<SupabaseConfig>('supabase');
        createClient(supabaseConfig.url, supabaseConfig.key, options);
      },
    },
    {
      provide: APP_GUARD,
      useClass: SupabaseAuthGuard,
    },
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
