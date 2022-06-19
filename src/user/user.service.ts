import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient, Role, User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaClient) {}

  async findOne(
    userWhereUnique: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: userWhereUnique,
    });
  }

  async updateEmail(
    userWhereUnique: Prisma.UserWhereUniqueInput,
    email: string,
  ): Promise<User> {
    return await this.prisma.user.update({
      where: userWhereUnique,
      data: {
        email: email,
      },
    });
  }

  async remove(userWhereUnique: Prisma.UserWhereUniqueInput): Promise<void> {
    await this.prisma.user.update({
      where: userWhereUnique,
      data: {
        isActive: false,
      },
    });
  }
}
