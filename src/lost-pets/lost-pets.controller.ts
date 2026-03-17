import { Body, Controller, Post } from '@nestjs/common';
import { CreateLostPetDto } from './dto/create-lost-pet.dto';
import { LostPetsService } from './lost-pets.service';

@Controller('lost-pets')
export class LostPetsController {
  constructor(private readonly service: LostPetsService) {}

  @Post()
  async create(@Body() dto: CreateLostPetDto) {
    return await this.service.create(dto);
  }
}

