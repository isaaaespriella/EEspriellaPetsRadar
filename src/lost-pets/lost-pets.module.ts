import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LostPetEntity } from './lost-pet.entity';
import { LostPetsService } from './lost-pets.service';
import { LostPetsController } from './lost-pets.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LostPetEntity]),
    NotificationsModule,
  ],
  providers: [LostPetsService],
  controllers: [LostPetsController],
})
export class LostPetsModule {}