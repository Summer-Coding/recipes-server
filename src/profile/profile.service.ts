import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaClient) {}

  async findOne(userId: string) {
    return await this.prisma.profile.findUnique({
      where: {
        userId,
      },
    });
  }

  async upsert(data: Prisma.ProfileUpdateInput) {
    return await this.prisma.profile.upsert({
      where: {
        userId: data.userId as string,
      },
      update: {
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
        profileImageSrc: data.profileImageSrc ?? '',
      },
      create: {
        userId: data.userId as string,
        username: data.username as string,
        firstName: data.firstName as string,
        lastName: data.lastName as string,
        profileImageSrc: data.profileImageSrc?.toString() ?? '',
      },
    });
  }

  async remove(userId: string) {
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
