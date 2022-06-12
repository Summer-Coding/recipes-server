import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt } from 'passport-jwt';
import { SupabaseAuthStrategy, SupabaseAuthUser } from 'nestjs-supabase-auth';
import { User } from '@supabase/supabase-js';

@Injectable()
export class SupabaseStrategy extends PassportStrategy(
  SupabaseAuthStrategy,
  'supabase',
) {
  public constructor() {
    super({
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_PRIVATE_KEY,
      supabaseOptions: {},
      supabaseJwtSecret: process.env.SUPABASE_JWT_SECRET,
      extractor: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  validate(payload: any): Promise<SupabaseAuthUser> {
    return super.validate(payload);
  }
}
