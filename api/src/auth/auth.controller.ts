import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  UseGuards,
  Req,
  SerializeOptions,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthEmailLoginDto } from './dto/auth-email-login.dto';
import { LoginResponse } from './types/login-response.type';
import { AuthRegisterDto } from './dto/auth-register.dto';
import { JwtRefreshGuard } from './guards/refresh.guard';

@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @SerializeOptions({ groups: ['me'] })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: AuthEmailLoginDto): Promise<LoginResponse> {
    return await this.authService.authenticate(dto);
  }

  @SerializeOptions({ groups: ['me'] })
  @Post('register')
  @HttpCode(HttpStatus.OK)
  async register(@Body() dto: AuthRegisterDto): Promise<LoginResponse> {
    return await this.authService.register(dto);
  }

  @SerializeOptions({ groups: ['me'] })
  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  refresh(@Req() request: any): Promise<Omit<LoginResponse, 'user'>> {
    return this.authService.refresh({ sessionId: request.user.sessionId });
  }

  // @Post('logout')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(AccessTokenGuard)
  // async logout(@Req() req: any) {
  //   this.authService.logout(req.user['sub']);
  // }
}
