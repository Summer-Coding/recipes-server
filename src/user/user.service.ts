import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaClient) {}

  async create(userCreateInput: Prisma.UserCreateInput) {
    return await this.prisma.user.create({
      data: {
        id: userCreateInput.id,
        email: userCreateInput.email,
      },
    });
  }

  async findOne(userWhereUnique: Prisma.UserWhereUniqueInput) {
    return await this.prisma.user.findUnique({
      where: userWhereUnique,
    });
  }

  async updateEmail(
    userWhereUnique: Prisma.UserWhereUniqueInput,
    email: string,
  ) {
    return await this.prisma.user.update({
      where: userWhereUnique,
      data: {
        email: email,
      },
    });
  }

  async remove(userWhereUnique: Prisma.UserWhereUniqueInput) {
    await this.prisma.user.update({
      where: userWhereUnique,
      data: {
        isActive: false,
      },
    });
  }
}
