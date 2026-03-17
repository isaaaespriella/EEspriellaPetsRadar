import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LostPetEntity } from './lost-pet.entity';
import { LostPetsController } from './lost-pets.controller';
import { LostPetsService } from './lost-pets.service';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([LostPetEntity]), NotificationsModule],
  controllers: [LostPetsController],
  providers: [LostPetsService],
  exports: [TypeOrmModule, LostPetsService],
})
export class LostPetsModule {}

