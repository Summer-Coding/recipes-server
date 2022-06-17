import { Controller, Get, Post, Delete, Put } from '@nestjs/common';
import { UserService } from './user.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserDto } from '../auth/dtos';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@CurrentUser() currentUser: UserDto) {
    return await this.userService.create({
      id: currentUser.id,
      email: currentUser.email!,
    });
  }

  @Get('whoami')
  async findOne(@CurrentUser() currentUser: UserDto) {
    return await this.userService.findOne({ id: currentUser.id });
  }

  @Put()
  async update(@CurrentUser() currentUser: UserDto) {
    return await this.userService.updateEmail(
      { id: currentUser.id },
      currentUser.email!,
    );
  }

  @Delete()
  async remove(@CurrentUser() currentUser: UserDto) {
    await this.userService.remove({ id: currentUser.id });
  }
}
