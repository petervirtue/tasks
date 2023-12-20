import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
} from 'class-validator';

export class Config {
  @IsEnum(['development', 'production'])
  NODE_ENV: 'development' | 'production';

  // Application
  @IsString()
  APP_NAME: string = 'Tasks';

  @IsNumber()
  APP_PORT: number = 3001;

  @IsString()
  APP_API_PREFIX: string = '/api';

  @IsUrl()
  PUBLIC_URL: string;

  // Database
  @IsEnum(['mysql', 'postgres'])
  DB_HOST: 'mysql' | 'postgres' = 'postgres';

  @IsNumber()
  DB_PORT: number = 5432;

  @IsString()
  DB_USERNAME: string;

  @IsString()
  DB_PASSWORD: string;

  @IsString()
  DB_DATABASE: string;

  @Transform(({ value }) => value !== 'false' && value !== '0')
  DB_SYNCHRONIZE: boolean = false;

  // Auth
  @IsString()
  ACCESS_SECRET: string;

  @IsString()
  REFRESH_SECRET: string;

  @IsString()
  @IsOptional()
  GOOGLE_CLIENT_ID?: string;

  @IsString()
  @IsOptional()
  GOOGLE_CLIENT_SECRET?: string;

  @IsUrl()
  @IsOptional()
  GOOGLE_CALLBACK_URL?: string;

  // Mail
  @IsString()
  MAIL_FROM?: string = 'noreply@localhost';

  @IsUrl()
  @IsOptional()
  @Matches(/^smtp:\/\//)
  MAIL_URL?: string;

  // Redis
  @IsUrl()
  @IsOptional()
  @Matches(/^redis:\/\//)
  REDIS_URL?: string;
}
