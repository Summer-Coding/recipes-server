import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { AuthDto, DevAuthDto } from './dtos';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(200)
  @Public()
  @Post('login')
  async login(@Body() authDto: DevAuthDto) {
    return await this.authService.signIn(authDto);
  }

  @HttpCode(201)
  @Public()
  @Post('sign-up')
  async signUp(@Body() authDto: AuthDto) {
    await this.authService.signUp(authDto);
  }
}
