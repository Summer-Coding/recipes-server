import { Injectable } from '@nestjs/common';
import { PrismaClient, Role } from '@prisma/client';
import { SupabaseClient } from '@supabase/supabase-js';
import { SetAdminDto, UserProfileListItemDto } from './dtos';

@Injectable()
export class AdminService {
  constructor(private supabase: SupabaseClient, private prisma: PrismaClient) {}

  async getAllUserIds(): Promise<Array<string>> {
    const { data, error } = await this.supabase.auth.api.listUsers();
    if (error) {
      throw new Error('could not get users');
    }

    return data.map((u) => u.id);
  }

  async getAllProfiles(
    userIds: string[],
  ): Promise<Array<UserProfileListItemDto>> {
    const profiles = await this.prisma.profile.findMany({
      where: {
        userId: {
          in: userIds,
        },
      },
      orderBy: {
        username: 'desc',
      },
      select: {
        id: true,
        userId: true,
        firstName: true,
        lastName: true,
        username: true,
        isActive: true,
        user: {
          select: {
            email: true,
            roles: true,
          },
        },
      },
    });

    return profiles.map((profile) => ({
      ...profile,
      email: profile?.user?.email,
      roles: profile?.user?.roles,
    }));
  }

  async setUserToAdmin(dto: SetAdminDto): Promise<void> {
    await this.supabase.auth.api.updateUserById(dto.id, {
      user_metadata: {
        roles: ['user', 'admin'],
      },
    });

    await this.prisma.user.update({
      where: {
        id: dto.id,
      },
      data: {
        roles: {
          push: Role.ADMIN,
        },
      },
    });
  }
}
