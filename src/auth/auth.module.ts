import { APP_GUARD } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GqlAuthGuard } from './guards/gql-auth.guard';
import { SupabaseStrategy } from './strategies/supabase.strategy';
import { PassportModule } from '@nestjs/passport';
import { AuthResolver } from './resolvers/auth.resolver';

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
    AuthResolver,
    SupabaseStrategy,
    {
      provide: SupabaseClient,
      useValue: supabase,
    },
  ],
  controllers: [AuthController],
  exports: [AuthService, SupabaseStrategy],
})
export class AuthModule {}
