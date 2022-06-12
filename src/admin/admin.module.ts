import { Module } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

const options = {
  schema: 'public',
  autoRefreshToken: true,
  persistSession: false,
  detectSessionInUrl: false,
};

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PRIVATE_KEY,
  options,
);

@Module({
  controllers: [AdminController],
  providers: [
    AdminService,
    {
      provide: SupabaseClient,
      useValue: supabase,
    },
  ],
})
export class AdminModule {}
