import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProfileModule } from './profile/profile.module';
import { UserModule } from './user/user.module';
import supabaseConfig from './environment/supabase.config';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [supabaseConfig],
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string(),
        SUPABASE_URL: Joi.string(),
        SUPABASE_KEY: Joi.string(),
        SUPABASE_PRIVATE_KEY: Joi.string(),
        SUPABASE_JWT_SECRET: Joi.string(),
      }),
      cache: true,
    }),
    AdminModule,
    AuthModule,
    PrismaModule,
    ProfileModule,
    UserModule,
  ],
})
export class AppModule {}
