import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './user/user.module';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [AuthModule, ConfigModule, DatabaseModule, UsersModule],
})
export class AppModule {}
