import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from 'src/users/users.service';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<any> {
    const user = await this.usersService.findOneByEmail(loginDto.email);

    if (user && (await bcrypt.compare(loginDto.password, user.password))) {
      const tokens = await this.fetchTokens(user.id, user.email);
      const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);
      const updateDto = new UpdateUserDto();
      updateDto.refreshToken = hashedRefreshToken;

      this.usersService.update(user.id, updateDto);

      return tokens;
    }

    throw new UnauthorizedException();
  }

  async logout(id: number): Promise<void> {
    const updateDto = new UpdateUserDto();
    updateDto.refreshToken = null;

    return this.usersService.update(id, updateDto);
  }

  async register(registerDto: RegisterDto): Promise<any> {
    const userExists = await this.usersService.findOneByEmail(
      registerDto.email,
    );

    if (userExists) {
      throw new BadRequestException('This email is already in use');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    registerDto.password = hashedPassword;

    const user = await this.usersService.create(registerDto);
    const tokens = await this.fetchTokens(user.id, user.email);
    const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);
    registerDto.refreshToken = hashedRefreshToken;

    await this.usersService.update(user.id, registerDto);

    return tokens;
  }

  async refresh(userId: number, refreshToken: string): Promise<any> {
    const user = await this.usersService.findOne(userId);

    if (!user || !user.refreshToken) {
      throw new ForbiddenException('Access denied');
    }

    if (!(await bcrypt.compare(refreshToken, user.refreshToken))) {
      throw new ForbiddenException('Access Denied');
    }

    const tokens = await this.fetchTokens(user.id, user.email);
    const updateDto = new UpdateUserDto();

    updateDto.refreshToken = await bcrypt.hash(tokens.refreshToken, 10);

    await this.usersService.update(user.id, updateDto);

    return tokens;
  }

  async fetchTokens(userId: number, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: this.configService.get<string>('JWT_SECRET_ACCESS'),
          expiresIn: '5m',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: this.configService.get<string>('JWT_SECRET_REFRESH'),
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  //   async createToken(user: User): Promise<string> {
  //     const payload = { email: user.email, sub: user.id };

  //     return this.jwtService.sign(payload);
  //   }

  //   async authenticate(email: string, password: string): Promise<User> {
  //     const user = await this.userService.findByEmail(email);

  //     if (user && (await bcrypt.compare(password, user.password))) {
  //       return user;
  //     }

  //     throw new UnauthorizedException();
  //   }

  //   async register(email: string, password: string): Promise<User> {
  //     return this.userService.createUser(email, password);
  //   }
}
