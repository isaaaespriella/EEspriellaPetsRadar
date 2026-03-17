import { Body, Controller, Post } from '@nestjs/common';
import { CreateFoundPetDto } from './dto/create-found-pet.dto';
import { FoundPetsService } from './found-pets.service';

@Controller('found-pets')
export class FoundPetsController {
  constructor(private readonly service: FoundPetsService) {}

  @Post()
  async create(@Body() dto: CreateFoundPetDto) {
    return await this.service.create(dto);
  }
}

