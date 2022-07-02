import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { PrismaClient } from '@prisma/client';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [ProfileController],
  providers: [ProfileService, PrismaClient],
  imports: [AuthModule],
})
export class ProfileModule {}
