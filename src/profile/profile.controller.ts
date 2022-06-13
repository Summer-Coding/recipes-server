import { Controller, Get, Post, Body, Delete } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpsertProfileDto } from './dto/upsert-profile.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserDto } from '../auth/dtos';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

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

  @Get()
  async findOne(@CurrentUser() currentUser: UserDto) {
    return await this.profileService.findOne(currentUser.id);
  }

  @Delete()
  async remove(@CurrentUser() currentUser: UserDto) {
    await this.profileService.remove(currentUser.id);
  }
}
