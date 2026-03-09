import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UserRole } from '../users/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() body: { name: string; email: string; password: string; role?: UserRole }) {
    return this.authService.register(body.name, body.email, body.password, body.role);
  }

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.authService.validateUser(body.email, body.password);
  }

  @Post('google-login')
  googleLogin(@Body() body: { profile: any }) {
    return this.authService.googleLogin(body.profile);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Request() req: any) {
    return req.user;
  }
}
