import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { AuthEmailLoginDto } from './dto/auth-email-login.dto';
import { LoginResponse } from './types/login-response.type';
import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthProvidersEnum } from './auth-providers.enum';
import bcrypt from 'bcryptjs';
import ms from 'ms';
import { SessionsService } from 'src/sessions/sessions.service';
import { User } from 'src/users/entities/user.entity';
import { Session } from 'src/sessions/entities/session.entity';
import { AuthRegisterDto } from './dto/auth-register.dto';
import { JwtRefreshPayload } from './types/jwt-refresh-payload.type';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private configService: ConfigService,
    private sessionsService: SessionsService,
  ) {}

  async authenticate(dto: AuthEmailLoginDto): Promise<LoginResponse> {
    const user = await this.usersService.findOneBy({ email: dto.email });

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

    const session = await this.sessionsService.create({ user });

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

  async register(dto: AuthRegisterDto): Promise<LoginResponse> {
    const hashedPassword = await this.hashPassword(dto.password);

    const user = await this.usersService.create({
      email: dto.email,
      password: hashedPassword,
      firstName: dto.firstName,
      lastName: dto.lastName,
    });

    // NOTE(petervirtue) - Generate email confirmation and send

    const session = await this.sessionsService.create({ user });

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

  async refresh(
    data: Pick<JwtRefreshPayload, 'sessionId'>,
  ): Promise<Omit<LoginResponse, 'user'>> {
    const session = await this.sessionsService.findOneBy({
      id: data.sessionId,
    });

    if (!session) {
      throw new UnauthorizedException();
    }

    /**
     * NOTE(petervirtue)
     * - Potentially add device identification to sessions
     * - Potentially create a new session each time we refresh
     */

    const { token, tokenExpires, refreshToken } = await this.getTokens(
      session.user.id,
      session.id,
    );

    return {
      token,
      tokenExpires,
      refreshToken,
    };
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();

    return bcrypt.hash(password, salt);
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
