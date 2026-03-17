import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LostPetEntity } from '../lost-pets/lost-pet.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { FoundPetEntity } from './found-pet.entity';
import { FoundPetsController } from './found-pets.controller';
import { FoundPetsService } from './found-pets.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([FoundPetEntity, LostPetEntity]),
    NotificationsModule,
  ],
  controllers: [FoundPetsController],
  providers: [FoundPetsService],
})
export class FoundPetsModule {}

