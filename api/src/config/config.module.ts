import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { plainToClass } from 'class-transformer';
import { Config } from './config';
import { validate } from 'class-validator';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      validate: async (config) => {
        const validated = plainToClass(Config, config, {
          enableImplicitConversion: true,
        });

        const errors = await validate(validated, {
          skipMissingProperties: false,
        });

        if (errors.length > 0) {
          throw new Error(
            `Configuration validation error: ${errors.toString()}`,
          );
        }

        return validated;
      },
    }),
  ],
})
export class ConfigModule {}
