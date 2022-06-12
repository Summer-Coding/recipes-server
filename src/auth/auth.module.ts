import { Module } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SupabaseStrategy } from './strategies/supabase.strategy';
import { PassportModule } from '@nestjs/passport';
import { APP_GUARD } from '@nestjs/core';
import { SupabaseAuthGuard } from './guards/supabase.guard';

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
  imports: [PassportModule],
  providers: [
    AuthService,
    SupabaseStrategy,
    {
      provide: SupabaseClient,
      useValue: supabase,
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
