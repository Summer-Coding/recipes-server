import { Controller, Get, Post, Body, Delete } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpsertProfileDto } from './dto/upsert-profile.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserDto } from '../auth/dtos';
import { UserService } from '../user/user.service';

@Controller('profile')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly userService: UserService,
  ) {}

  @Get()
  async findOne(@CurrentUser() currentUser: UserDto) {
    return await this.profileService.findOne(currentUser.id);
  }

  @Post()
  async create(
    @CurrentUser() currentUser: UserDto,
    @Body() dto: UpsertProfileDto,
  ) {
    await this.userService.createIfNotExists({
      id: currentUser.id,
      email: currentUser.email as string,
    });

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
