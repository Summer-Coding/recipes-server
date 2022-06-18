import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { PrismaClient } from '@prisma/client';
import { UserService } from 'src/user/user.service';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import { SupabaseConfig } from '../environment';

const options = {
  persistSession: false,
  detectSessionInUrl: false,
};

@Module({
  controllers: [ProfileController],
  providers: [
    AuthService,
    ProfileService,
    PrismaClient,
    UserService,
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
  ],
  imports: [AuthModule, UserModule],
})
export class ProfileModule {}
