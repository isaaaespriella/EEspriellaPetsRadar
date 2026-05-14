import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Cache } from 'cache-manager';
import { toPoint } from '../common/geo/geo.utils';
import { CACHE_LOST_PETS_ACTIVE } from '../common/cache/cache-keys';
import { CreateLostPetDto } from './dto/create-lost-pet.dto';
import { LostPetEntity } from './lost-pet.entity';
import { MailService } from '../notifications/mail.service';
import { logger } from '../config/logger';

@Injectable()
export class LostPetsService {
  constructor(
    @InjectRepository(LostPetEntity)
    private readonly lostPetRepository: Repository<LostPetEntity>,
    private readonly mailService: MailService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  async findAllActive(): Promise<LostPetEntity[]> {
    const rows = await this.lostPetRepository.find({
      where: { is_active: true },
      order: { created_at: 'DESC' },
    });
    logger.info('Listado de mascotas perdidas activas', { count: rows.length });
    return rows;
  }

  async create(dto: CreateLostPetDto) {
    logger.info('Registro de mascota perdida iniciado', {
      name: dto.name,
      species: dto.species,
    });
    const lost = this.lostPetRepository.create({
      name: dto.name,
      species: dto.species,
      breed: dto.breed,
      color: dto.color,
      size: dto.size,
      description: dto.description,
      photo_url: dto.photo_url,
      owner_name: dto.ownerName,
      owner_email: dto.ownerEmail,
      owner_phone: dto.ownerPhone,
      address: dto.address,
      lost_date: dto.lostDate,
      location: toPoint({ lng: dto.lng, lat: dto.lat }),
    });
    await this.lostPetRepository.save(lost);
    await this.cache.del(CACHE_LOST_PETS_ACTIVE);
    logger.info('Mascota perdida guardada e invalidación de caché', {
      id: lost.id,
      cacheKey: CACHE_LOST_PETS_ACTIVE,
    });
    await this.mailService.sendMatchEmail({
      to: 'elenaespri@gmail.com',
      subject: '🐾 Nueva mascota perdida',
      html: `
      <div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:20px;">
        <div style="max-width:600px; margin:auto; background:white; border-radius:10px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.1);">
          <div style="background:#4f46e5; color:white; padding:20px; text-align:center;">
            <h2 style="margin:0;">PetRadar 🐾</h2>
            <p style="margin:5px 0 0;">Nueva mascota reportada</p>
          </div>
          <div style="padding:20px;">
            <h3 style="margin-top:0;">${dto.name}</h3>
            <p><b>Especie:</b> ${dto.species}</p>
            <p><b>Raza:</b> ${dto.breed}</p>
            <p><b>Color:</b> ${dto.color}</p>
            <p><b>Tamaño:</b> ${dto.size}</p>
            <hr/>
            <p><b>Descripción:</b></p>
            <p style="color:#555;">${dto.description}</p>
            <hr/>
            <p><b>Dueño:</b> ${dto.ownerName}</p>
            <p><b>Teléfono:</b> ${dto.ownerPhone}</p>
            <div style="margin-top:20px; text-align:center;">
              <a href="https://www.google.com/maps?q=${dto.lat},${dto.lng}"
                 style="background:#4f46e5; color:white; padding:10px 20px; border-radius:5px; text-decoration:none;">
                 Ver ubicación 📍
              </a>
            </div>
          </div>
          <div style="background:#f4f6f8; text-align:center; padding:10px; font-size:12px; color:#888;">
            PetRadar © 2026
          </div>
        </div>
      </div>
      `,
    });

    logger.info('Registro de mascota perdida finalizado', { id: lost.id });

    return { message: 'Mascota registrada y correo enviado' };
  }
}
