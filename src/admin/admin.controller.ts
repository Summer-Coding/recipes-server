import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { AdminService } from './admin.service';
import { Roles } from '../auth/decorators';
import { RolesGuard } from '../auth/guards';
import { SetAdminDto } from './dtos';

@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
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
