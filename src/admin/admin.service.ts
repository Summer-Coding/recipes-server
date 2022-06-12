import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SupabaseClient, User } from '@supabase/supabase-js';
import { SetAdminDto } from './dtos';

@Injectable()
export class AdminService {
  constructor(private supabase: SupabaseClient) {}

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
