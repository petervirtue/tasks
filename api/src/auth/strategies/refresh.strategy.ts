import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { Config } from 'src/config/config';
import { Payload } from '../types/payload';
import { AuthService } from '../auth.service';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor(
    private readonly configService: ConfigService<Config>,
    private readonly authService: AuthService,
  ) {
    super({
      secretOrKey: configService.getOrThrow<string>('REFRESH_SECRET'),
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      passReqToCallback: true,
      ignoreExpiration: true,
    } as StrategyOptions);
  }

  async validate(request: Request, payload: Payload) {
    const refreshToken = request.body?.refreshToken;

    return this.authService.validateRefreshToken(payload, refreshToken);
  }
}
