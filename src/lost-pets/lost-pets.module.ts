import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LostPetEntity } from './lost-pet.entity';
import { LostPetsController } from './lost-pets.controller';
import { LostPetsService } from './lost-pets.service';

@Module({
  imports: [TypeOrmModule.forFeature([LostPetEntity])],
  controllers: [LostPetsController],
  providers: [LostPetsService],
  exports: [TypeOrmModule, LostPetsService],
})
export class LostPetsModule {}

