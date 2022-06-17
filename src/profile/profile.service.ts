import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient, Profile } from '@prisma/client';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaClient) {}

  async findOne(userId: string): Promise<Profile | null> {
    return await this.prisma.profile.findUnique({
      where: {
        userId,
      },
    });
  }

  async upsert(data: Prisma.ProfileUncheckedCreateInput): Promise<Profile> {
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
