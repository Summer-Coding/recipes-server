import { Controller, Get, Post, Body, Delete } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpsertProfileDto } from './dtos/upsert-profile.dto';
import { CurrentUser } from '../auth/decorators';
import { UserDto } from '../auth/dtos';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  async findOne(@CurrentUser() currentUser: UserDto) {
    return await this.profileService.findOne(currentUser.id);
  }

  @Post()
  async create(
    @CurrentUser() currentUser: UserDto,
    @Body() dto: UpsertProfileDto,
  ) {
    return await this.profileService.upsert({
      ...dto,
      userId: currentUser.id,
    });
  }

  @Delete()
  async remove(@CurrentUser() currentUser: UserDto) {
    await this.profileService.remove(currentUser.id);
  }
}
