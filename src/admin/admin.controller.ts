import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { Role } from '../auth/constants';
import { Roles } from '../auth/decorators';
import { RolesGuard } from '../auth/guards';
import { SetAdminDto } from './dtos';

@UseGuards(RolesGuard)
@Roles(Role.Admin)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @HttpCode(HttpStatus.OK)
  @Get('users')
  async getAllUsers() {
    return await this.adminService.getAllProfiles();
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('create')
  async setUserToAdmin(@Body() dto: SetAdminDto) {
    await this.adminService.setUserToAdmin(dto);
  }
}
