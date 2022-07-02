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
import { SetAdminDto } from './dtos';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/constants/role.enum';
import { RolesGuard } from '../auth/guards/roles.guard';

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
