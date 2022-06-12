import { Controller, Get, Post, Body, Delete, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpsertProfileDto } from './dto/upsert-profile.dto';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserDto } from '../auth/dtos';

@UseGuards(GqlAuthGuard)
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Post()
  async create(
    @CurrentUser() currentUser: UserDto,
    @Body() createProfileDto: UpsertProfileDto,
  ) {
    return await this.profileService.upsert({
      ...createProfileDto,
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