import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { AuthEmailLoginDto } from './dto/auth-email-login.dto';
import { LoginResponse } from './types/login-response.type';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AuthProvidersEnum } from './auth-providers.enum';
import bcrypt from 'bcryptjs';
import ms from 'ms';
import { SessionsService } from 'src/sessions/sessions.service';
import { User } from 'src/users/entities/user.entity';
import { Session } from 'src/sessions/entities/session.entity';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private configService: ConfigService,
    private sessionsServive: SessionsService,
  ) {}

  async authenticate(dto: AuthEmailLoginDto): Promise<LoginResponse> {
    const user = await this.usersService.findOne({ email: dto.email });

    if (!user) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            email: 'notFound',
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    if (user.provider !== AuthProvidersEnum.email) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            email: `loginViaProvider:${user.provider}`,
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.password);

    if (!passwordMatch) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            password: 'incorrectPassword',
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const session = await this.sessionsServive.create({ user });

    const { token, tokenExpires, refreshToken } = await this.getTokens(
      user.id,
      session.id,
    );

    return {
      token,
      tokenExpires,
      refreshToken,
      user,
    };
  }

  private async getTokens(
    id: User['id'],
    sessionId: Session['id'],
  ): Promise<any> {
    const tokenExpiresIn = this.configService.getOrThrow('auth.expires', {
      infer: true,
    });
    const tokenExpires = Date.now() + ms(tokenExpiresIn);

    const [token, refreshToken] = await Promise.all([
      await this.jwtService.signAsync(
        {
          id: id,
          sessionId: sessionId,
        },
        {
          secret: this.configService.getOrThrow('auth.secret', { infer: true }),
          expiresIn: tokenExpiresIn,
        },
      ),
      await this.jwtService.signAsync(
        {
          sessionId: sessionId,
        },
        {
          secret: this.configService.getOrThrow('auth.refreshSecret', {
            infer: true,
          }),
          expiresIn: this.configService.getOrThrow('auth.refreshExpires', {
            infer: true,
          }),
        },
      ),
    ]);

    return {
      token,
      tokenExpires,
      refreshToken,
    };
  }
}
