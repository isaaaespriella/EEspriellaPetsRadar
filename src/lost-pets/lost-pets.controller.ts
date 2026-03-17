import { Controller, Post, Body } from '@nestjs/common';
import { LostPetsService } from './lost-pets.service';
import { CreateLostPetDto } from './dto/create-lost-pet.dto';

@Controller('lost-pets')
export class LostPetsController {
  constructor(private readonly service: LostPetsService) {}

  @Post()
  create(@Body() dto: CreateLostPetDto) {
    return this.service.create(dto);
  }
}