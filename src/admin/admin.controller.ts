import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UserDto } from '../auth/dtos';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { AdminService } from './admin.service';
import { SetAdminRequest } from './dtos';

@UseGuards(GqlAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  async getAllUsers(@CurrentUser() currentUser: UserDto) {
    const users = await this.adminService.getAllUsers(currentUser.id);
    return await this.adminService.getAllProfiles(users);
  }

  @Post('create')
  async create(
    @CurrentUser() currentUser: UserDto,
    @Body() request: SetAdminRequest,
  ) {
    await this.adminService.setUserToAdmin({
      currentUserId: currentUser.id,
      newAdminId: request.id,
    });
  }
}
