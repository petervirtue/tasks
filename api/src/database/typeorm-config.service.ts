import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      synchronize: process.env.DB_SYNCHRONIZE === 'true',
      dropSchema: false,
      logging: process.env.NODE_ENV !== 'production',
      keepConnectionAlive: true,
      entities: [__dirname + '/../**/*.entity.{.ts,.js}'],
      migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
      cli: {
        entitiesDir: 'src',
        migrationsDir: 'src/database/migrations',
        subscribersDir: 'subscriber',
      },
      //   extra: {
      //     // NOTE(petervirtue) - https://node-postgres.com/api/pool
      //     max: process.env.DATABASE_MAX_CONNECTIONS
      //       ? parseInt(process.env.DATABASE_MAX_CONNECTIONS, 10)
      //       : 100,
      //     ssl:
      //       process.env.DATABASE_SSL_ENABLED === 'true'
      //         ? {
      //             rejectUnauthorized:
      //               process.env.DATABASE_REJECT_UNAUTHORIZED === 'true',
      //             ca: process.env.DATABASE_CA ?? undefined,
      //             key: process.env.DATABASE_KEY ?? undefined,
      //             cert: process.env.DATABASE_CERT ?? undefined,
      //           }
      //         : undefined,
      //   },
    } as TypeOrmModuleOptions;
  }
}
