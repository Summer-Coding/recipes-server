import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { SupabaseClient, User } from '@supabase/supabase-js';
import { UserDto } from 'src/auth/dtos';
import { SetAdminDto } from './dtos';
import { UserProfileListItemDto } from './dtos/user-profile-list-item.dto';

@Injectable()
export class AdminService {
  constructor(private supabase: SupabaseClient, private prisma: PrismaClient) {}

  async getAllUsers(currentUserId: string): Promise<Array<User>> {
    if (!(await this.checkIfUserIsAdmin(currentUserId))) {
      throw new UnauthorizedException();
    }

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
              roles: u.user_metadata?.roles ?? [],
            }))
            .find((u) => u.id === profile.userId),
        } as UserProfileListItemDto),
    );
  }

  async setUserToAdmin(dto: SetAdminDto): Promise<void> {
    if (!(await this.checkIfUserIsAdmin(dto.currentUserId))) {
      throw new UnauthorizedException();
    }

    await this.supabase.auth.api.updateUserById(dto.newAdminId, {
      user_metadata: {
        roles: ['user', 'admin'],
      },
    });
  }

  private async checkIfUserIsAdmin(currentUserId: string): Promise<boolean> {
    const { data, error } = await this.supabase.auth.api.getUserById(
      currentUserId,
    );

    if (!!error || (data?.user_metadata?.roles ?? []).length === 0) {
      return false;
    }

    const roles = data.user_metadata.roles as string[];
    return roles.includes('admin');
  }
}
