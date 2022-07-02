import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators';
import { AuthDto, PasswordAuthDto } from './dtos';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('login')
  async login(@Body() authDto: AuthDto) {
    await this.authService.signInAndCreateIfNotExists(authDto);
  }

  @HttpCode(200)
  @Public()
  @Post('login-password')
  async loginWithPassword(@Body() authDto: PasswordAuthDto) {
    return await this.authService.signInWithPassword(authDto);
  }
}
