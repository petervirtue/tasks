import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcryptjs from 'bcryptjs';
import { Payload } from './types/payload';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { GrantType } from './enums/grant-type.enum';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Config } from 'src/config/config';
import { randomBytes } from 'crypto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponse } from './types/auth-response';
import { Provider } from './enums/provider.enum';
import { QueryFailedError } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService<Config>,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async authenticate({
    identifier,
    password,
  }: LoginDto): Promise<AuthResponse> {
    try {
      const user = await this.userService.findOneByIdentifier(identifier);

      if (!user) {
        throw new BadRequestException('Invalid credentials, please try again.');
      }

      if (!user.secret?.password) {
        throw new BadRequestException(`Please sign in using ${user.provider}.`);
      }

      await this.validatePassword(password, user.secret?.password);

      return await this.createAuthResponse(user);
    } catch (error) {
      throw new BadRequestException('Invalid credentials, please try again.');
    }
  }

  async register(data: RegisterDto): Promise<AuthResponse> {
    const { password, ...filteredData } = data;
    const userPartial = { ...filteredData, provider: Provider.CREDENTIALS };
    const hashedPassword = await this.hash(password);

    try {
      const user = await this.userService.create(userPartial, hashedPassword);

      // Send verification email

      return await this.createAuthResponse(user);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const match = (error as any).detail.match(
          /Key \(([^)]+)\)=\([^)]+\) already exists/,
        );

        throw new BadRequestException(`This ${match[1]} is already in use.`);
      }

      throw new InternalServerErrorException(
        'An internal error has occurred. Please contact engineering.',
      );
    }
  }

  async refresh(user: User): Promise<AuthResponse> {
    return this.createAuthResponse(user);
  }

  async validateRefreshToken(
    payload: Payload,
    refreshToken: string,
  ): Promise<User> {
    const user = await this.userService.findOneById(payload.id);
    const storedRefreshToken = user.secret?.refreshToken;

    if (!storedRefreshToken || storedRefreshToken !== refreshToken) {
      throw new UnauthorizedException();
    }

    if (user.twoFactorEnabled && !payload.isTwoFactorAuth) {
      throw new UnauthorizedException();
    }

    return user;
  }

  private async createAuthResponse(user: User): Promise<AuthResponse> {
    try {
      const payload = {
        id: user.id,
        isTwoFactorAuth: user.twoFactorEnabled,
      } as Payload;

      const accessToken = this.generateToken(GrantType.ACCESS, payload);
      const refreshToken = this.generateToken(GrantType.REFRESH, payload);

      await this.userService.updateRefreshToken(user.id, refreshToken);

      return {
        accessToken,
        refreshToken,
        user,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Something has gone wrong with generating authorization tokens. Please contact engineering.',
      );
    }
  }

  private generateToken(grantType: GrantType, payload?: Payload): string {
    if (grantType === GrantType.ACCESS) {
      if (!payload) {
        throw new InternalServerErrorException(
          'Payload must be sent for access token generation.',
        );
      }

      return this.jwtService.sign(payload, {
        secret: this.configService.getOrThrow('ACCESS_SECRET'),
        expiresIn: '15m',
      });
    } else if (grantType === GrantType.REFRESH) {
      if (!payload) {
        throw new InternalServerErrorException(
          'Payload must be sent for access token generation.',
        );
      }

      return this.jwtService.sign(payload, {
        secret: this.configService.getOrThrow('REFRESH_SECRET'),
        expiresIn: '2d',
      });
    } else if (grantType === GrantType.RESET) {
      // Coming soon
      return '';
    } else if (grantType === GrantType.VERIFY) {
      return randomBytes(32).toString('base64url');
    }
  }

  private async validatePassword(
    password: string,
    hashedPassword: string,
  ): Promise<void> {
    const valid = await this.compare(password, hashedPassword);

    if (!valid) {
      throw new BadRequestException('Invalid credentials.');
    }
  }

  private hash(password: string): Promise<string> {
    return bcryptjs.hash(password, 10);
  }

  private compare(password: string, hash: string): Promise<boolean> {
    return bcryptjs.compare(password, hash);
  }
}
