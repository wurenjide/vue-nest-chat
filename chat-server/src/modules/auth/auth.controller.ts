import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }
  // 登录测试
  @UseGuards(AuthGuard('local'))
  @Post('/login')
  async login(@Body() user: any) {
    return this.authService.login(user);
  }

  @UseGuards(AuthGuard('local'))
  @Post('/register')
  async register(@Body() data: any) {
    return this.authService.register(data);
  }
}
