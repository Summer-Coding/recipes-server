import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { User } from '@supabase/supabase-js';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { AdminService } from './admin.service';
import { SetAdminRequest } from './dtos';

@UseGuards(GqlAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('create')
  async create(
    @CurrentUser() currentUser: User,
    @Body() request: SetAdminRequest,
  ) {
    await this.adminService.setUserToAdmin({
      currentUserId: currentUser.id,
      newAdminId: request.id,
    });
  }
}
