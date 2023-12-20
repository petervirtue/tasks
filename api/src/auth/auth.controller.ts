import {
  Controller,
  HttpStatus,
  Post,
  HttpCode,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { AuthResponse } from './types/auth-response';
import { LoginDto } from './dto/login.dto';
import { RefreshGuard } from './guards/refresh.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // @SerializeOptions({ groups: ['me'] })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  public async login(@Body() data: LoginDto): Promise<AuthResponse> {
    return await this.authService.authenticate(data);
  }

  // @SerializeOptions({ groups: ['me'] })
  @Post('register')
  @HttpCode(HttpStatus.OK)
  public async register(@Body() data: RegisterDto): Promise<AuthResponse> {
    return await this.authService.register(data);
  }

  @Post('refresh')
  @UseGuards(RefreshGuard)
  @HttpCode(HttpStatus.OK)
  public async refresh(@Request() request: any): Promise<AuthResponse> {
    return this.authService.refresh(request.user);
  }
}
