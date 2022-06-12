import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { SetAdminDto } from './dtos';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/constants/role.enum';
import { RolesGuard } from '../auth/guards/roles.guard';

@UseGuards(RolesGuard)
@Roles(Role.Admin)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  async getAllUsers() {
    const users = await this.adminService.getAllUsers();
    return await this.adminService.getAllProfiles(users);
  }

  @Post('create')
  async create(@Body() dto: SetAdminDto) {
    await this.adminService.setUserToAdmin(dto);
  }
}
