import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { SupabaseConfig } from '../environment/supabase.config';

const options = {
  schema: 'public',
  autoRefreshToken: true,
  persistSession: false,
  detectSessionInUrl: false,
};

@Module({
  controllers: [AdminController],
  providers: [
    AdminService,
    PrismaClient,
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
})
export class AdminModule {}
