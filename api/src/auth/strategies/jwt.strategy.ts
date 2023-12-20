import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { Config } from 'src/config/config';
import { UserService } from 'src/user/user.service';
import { Payload } from '../types/payload';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly userService: UserService,
    readonly configService: ConfigService<Config>,
  ) {
    super({
      secretOrKey: configService.getOrThrow<string>('ACCESS_SECRET'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
    } as StrategyOptions);
  }

  async validate(payload: Payload): Promise<User> {
    return await this.userService.findOneById(payload.id);
  }
}
