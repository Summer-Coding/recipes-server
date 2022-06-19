import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { SupabaseClient } from '@supabase/supabase-js';
import { SetAdminDto, UserProfileListItemDto } from './dtos';

@Injectable()
export class AdminService {
  constructor(private supabase: SupabaseClient, private prisma: PrismaClient) {}

  async getAllProfiles(): Promise<Array<UserProfileListItemDto>> {
    const profiles = await this.prisma.profile.findMany({
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
    const { error } = await this.supabase.auth.api.updateUserById(dto.id, {
      user_metadata: {
        roles: ['USER', 'ADMIN'],
      },
    });

    if (error) {
      throw new Error('could not set user to admin');
    }
  }
}
