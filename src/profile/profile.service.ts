import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient, Profile } from '@prisma/client';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaClient, private authService: AuthService) {}

  async findOne(userId: string): Promise<Profile | null> {
    return await this.prisma.profile.findUnique({
      where: {
        userId,
      },
    });
  }

  async upsert(data: Prisma.ProfileUncheckedCreateInput): Promise<Profile> {
    await this.authService.setUsername(data.userId, data.username);

    return await this.prisma.profile.upsert({
      where: {
        userId: data.userId,
      },
      update: {
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
        profileImageSrc: data.profileImageSrc,
      },
      create: {
        userId: data.userId,
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
        profileImageSrc: data.profileImageSrc,
      },
    });
  }

  async remove(userId: string): Promise<void> {
    await this.prisma.profile.update({
      where: {
        userId,
      },
      data: {
        isActive: false,
      },
    });
  }
}
