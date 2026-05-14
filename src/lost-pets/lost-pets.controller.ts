import { Body, Controller, Get, Post, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { LostPetsService } from './lost-pets.service';
import { CreateLostPetDto } from './dto/create-lost-pet.dto';
import { CACHE_LOST_PETS_ACTIVE } from '../common/cache/cache-keys';

@Controller('lost-pets')
export class LostPetsController {
  constructor(private readonly service: LostPetsService) {}

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheKey(CACHE_LOST_PETS_ACTIVE)
  @CacheTTL(60_000)
  findAllActive() {
    return this.service.findAllActive();
  }

  @Post()
  create(@Body() dto: CreateLostPetDto) {
    return this.service.create(dto);
  }
}
