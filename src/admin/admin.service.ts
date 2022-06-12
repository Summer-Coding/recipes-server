import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { SupabaseClient, User } from '@supabase/supabase-js';
import { UserDto } from 'src/auth/dtos';
import { SetAdminDto, UserProfileListItemDto } from './dtos';

@Injectable()
export class AdminService {
  constructor(private supabase: SupabaseClient, private prisma: PrismaClient) {}

  async getAllUsers(): Promise<Array<User>> {
    const { data, error } = await this.supabase.auth.api.listUsers();
    if (error) {
      throw new Error('could not get users');
    }

    return data;
  }

  async getAllProfiles(
    users: UserDto[],
  ): Promise<Array<UserProfileListItemDto>> {
    const profiles = await this.prisma.profile.findMany({
      where: {
        userId: {
          in: users.map((x) => x.id),
        },
      },
      select: {
        firstName: true,
        lastName: true,
        username: true,
        userId: true,
        isActive: true,
      },
    });

    return profiles.map(
      (profile) =>
        ({
          ...profile,
          ...users
            .map((u) => ({
              ...u,
              id: u.id,
              roles: u.user_metadata?.roles ?? [],
            }))
            .find((u) => u.id === profile.userId),
        } as UserProfileListItemDto),
    );
  }

  async setUserToAdmin(dto: SetAdminDto): Promise<void> {
    await this.supabase.auth.api.updateUserById(dto.id, {
      user_metadata: {
        roles: ['user', 'admin'],
      },
    });
  }
}
