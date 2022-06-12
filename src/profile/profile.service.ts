import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaClient) {}

  async findOne(userId: string) {
    return await this.prisma.profile.findUnique({
      where: {
        userId: userId,
      },
    });
  }

  async upsert(data: Prisma.ProfileUpdateInput) {
    return await this.prisma.profile.upsert({
      where: {
        userId: data.userId.toString(),
      },
      update: {
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
        profileImageSrc: data.profileImageSrc ?? '',
      },
      create: {
        userId: data.userId.toString(),
        username: data.username.toString(),
        firstName: data.firstName.toString(),
        lastName: data.lastName.toString(),
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
