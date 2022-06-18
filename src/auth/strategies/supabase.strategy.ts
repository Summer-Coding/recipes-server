import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt } from 'passport-jwt';
import { SupabaseAuthStrategy, SupabaseAuthUser } from 'nestjs-supabase-auth';
import { User } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import { SupabaseConfig } from '../../environment';

@Injectable()
export class SupabaseStrategy extends PassportStrategy(
  SupabaseAuthStrategy,
  'supabase',
) {
  public constructor(private configService: ConfigService) {
    const supabaseConfig = configService.getOrThrow<SupabaseConfig>('supabase');
    super({
      supabaseUrl: supabaseConfig.url,
      supabaseKey: supabaseConfig.privateKey,
      supabaseOptions: {},
      supabaseJwtSecret: supabaseConfig.jwtSecret,
      extractor: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  validate(payload: any): Promise<SupabaseAuthUser> {
    return super.validate(payload);
  }
}
