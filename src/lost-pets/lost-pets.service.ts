import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { toPoint } from '../common/geo/geo.utils';
import { CreateLostPetDto } from './dto/create-lost-pet.dto';
import { LostPetEntity } from './lost-pet.entity';

@Injectable()
export class LostPetsService {
  constructor(
    @InjectRepository(LostPetEntity)
    private readonly repo: Repository<LostPetEntity>,
  ) {}

  async create(dto: CreateLostPetDto) {
    const entity = this.repo.create({
      name: dto.name,
      species: dto.species,
      breed: dto.breed,
      color: dto.color,
      size: dto.size,
      description: dto.description,
      photoUrl: dto.photoUrl ?? null,
      ownerName: dto.ownerName,
      ownerEmail: dto.ownerEmail,
      ownerPhone: dto.ownerPhone,
      location: toPoint({ lng: dto.lng, lat: dto.lat }),
      address: dto.address,
      lostDate: dto.lostDate,
      isActive: dto.isActive ?? true,
    });

    return await this.repo.save(entity);
  }
}

