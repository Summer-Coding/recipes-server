import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { PrismaClient } from '@prisma/client';
import { UserService } from 'src/user/user.service';
import { UserModule } from 'src/user/user.module';

@Module({
  controllers: [ProfileController],
  providers: [ProfileService, PrismaClient, UserService],
  imports: [UserModule],
})
export class ProfileModule {}
