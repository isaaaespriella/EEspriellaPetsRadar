import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import Keyv from 'keyv';
import KeyvRedis from '@keyv/redis';
import { FoundPetsModule } from './found-pets/found-pets.module';
import { LostPetsModule } from './lost-pets/lost-pets.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const disabled = config.get<string>('REDIS_DISABLED', 'false') === 'true';
        if (disabled) {
          return { ttl: 60_000 };
        }
        const url =
          config.get<string>('REDIS_URL') ??
          `redis://${config.get<string>('REDIS_HOST', '127.0.0.1')}:${config.get<string>('REDIS_PORT', '6379')}`;
        const store = new KeyvRedis(url);
        const keyv = new Keyv({ store, ttl: 60_000 });
        return { stores: [keyv] };
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.get<string>('DB_HOST', '127.0.0.1'),
        port: Number(config.get<string>('DB_PORT', '5432')),
        username: config.get<string>('DB_USER', 'postgres'),
        password: config.get<string>('DB_PASSWORD', 'root'),
        database: config.get<string>('DB_NAME', 'petradar'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: config.get<string>('DB_SYNC', 'true') === 'true',
      }),
    }),
    NotificationsModule,
    LostPetsModule,
    FoundPetsModule,
  ],
})
export class AppModule {}
