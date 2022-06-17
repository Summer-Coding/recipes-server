import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient, User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaClient) {}

  async createIfNotExists(
    userCreateInput: Prisma.UserCreateInput,
  ): Promise<void> {
    const userCount = await this.prisma.user.count({
      where: {
        id: userCreateInput.id,
      },
    });

    if (userCount === 0) {
      this.create(userCreateInput);
    }
  }

  private async create(userCreateInput: Prisma.UserCreateInput): Promise<void> {
    await this.prisma.user.create({
      data: {
        id: userCreateInput.id,
        email: userCreateInput.email,
      },
    });
  }

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
