import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  UseGuards,
  Req,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AccessTokenGuard } from '../common/guards/access.guard';
import { RefreshTokenGuard } from 'src/common/guards/refresh.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return await this.authService.login(loginDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('register')
  async register(
    @Body() createUserDto: RegisterDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return await this.authService.register(createUserDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  @UseGuards(AccessTokenGuard)
  async logout(@Req() req: any) {
    this.authService.logout(req.user['sub']);
  }

  @Get('refresh')
  @UseGuards(RefreshTokenGuard)
  refreshTokens(@Req() req: any) {
    const userId = req.user['sub'];
    const refreshToken = req.user['refreshToken'];

    return this.authService.refresh(userId, refreshToken);
  }
}
