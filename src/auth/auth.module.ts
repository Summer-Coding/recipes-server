import { APP_GUARD } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GqlAuthGuard } from './guards/gql-auth.guard';
import { SupabaseStrategy } from './strategies/supabase.strategy';

const options = {
  autoRefreshToken: true,
  persistSession: false,
  detectSessionInUrl: false,
};

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
  options,
);

@Module({
  providers: [
    AuthService,
    SupabaseStrategy,
    {
      provide: SupabaseClient,
      useValue: supabase,
    },
  ],
  controllers: [AuthController],
})
export class AuthModule {}
