import { Controller, Get, Delete, Patch, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserDto } from '../auth/dtos';
import { UpdateEmailDto } from './dtos/update-email.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('whoami')
  async findOne(@CurrentUser() currentUser: UserDto) {
    return await this.userService.findOne({ id: currentUser.id });
  }

  @Patch('email')
  async updateEmail(
    @CurrentUser() currentUser: UserDto,
    @Body() updateEmailDto: UpdateEmailDto,
  ) {
    return await this.userService.updateEmail(
      { id: currentUser.id },
      updateEmailDto.email,
    );
  }

  @Delete()
  async remove(@CurrentUser() currentUser: UserDto) {
    await this.userService.remove({ id: currentUser.id });
  }
}
