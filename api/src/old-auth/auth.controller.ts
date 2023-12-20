import {
  Delete,
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  UseGuards,
  Request,
  SerializeOptions,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthEmailLoginDto } from './dto/auth-email-login.dto';
import { LoginResponse } from './types/login-response.type';
import { AuthRegisterDto } from './dto/auth-register.dto';
import { JwtRefreshGuard } from './guards/refresh.guard';
import { JwtGuard } from './guards/access.guard';

@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @SerializeOptions({ groups: ['me'] })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  public async login(@Body() dto: AuthEmailLoginDto): Promise<LoginResponse> {
    return await this.authService.authenticate(dto);
  }

  @SerializeOptions({ groups: ['me'] })
  @Post('register')
  @HttpCode(HttpStatus.OK)
  public async register(@Body() dto: AuthRegisterDto): Promise<LoginResponse> {
    return await this.authService.register(dto);
  }

  @SerializeOptions({ groups: ['me'] })
  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  refresh(@Request() request: any): Promise<Omit<LoginResponse, 'user'>> {
    return this.authService.refresh({ sessionId: request.user.sessionId });
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtGuard)
  public async logout(@Request() request: any): Promise<void> {
    return this.authService.logout(request.user.sessionId);
  }

  @Delete('profile')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtGuard)
  public async delete(@Request() request: any): Promise<void> {
    return this.authService.delete(request.user);
  }
}
