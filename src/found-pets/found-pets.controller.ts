import { Body, Controller, Get, Post, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { FoundPetsService } from './found-pets.service';
import { CreateFoundPetDto } from './dto/create-found-pet.dto';
import { CACHE_FOUND_PETS_ALL } from '../common/cache/cache-keys';

@Controller('found-pets')
export class FoundPetsController {
  constructor(private service: FoundPetsService) {}

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheKey(CACHE_FOUND_PETS_ALL)
  @CacheTTL(60_000)
  findAll() {
    return this.service.findAll();
  }

  @Post()
  create(@Body() dto: CreateFoundPetDto) {
    return this.service.create(dto);
  }
}
