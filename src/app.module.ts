import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import supabaseConfig from './environment/supabase.config';
import webConfig from './environment/web.config';
import { PrismaModule } from './prisma/prisma.module';
import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [supabaseConfig, webConfig],
      validationSchema: Joi.object({
        WEB_URL: Joi.string().required(),
        DATABASE_URL: Joi.string().required(),
        SUPABASE_URL: Joi.string().required(),
        SUPABASE_KEY: Joi.string().required(),
        SUPABASE_PRIVATE_KEY: Joi.string().required(),
        SUPABASE_JWT_SECRET: Joi.string().required(),
      }),
      cache: true,
    }),
    AdminModule,
    AuthModule,
    PrismaModule,
    ProfileModule,
  ],
})
export class AppModule {}
