import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import { FoundPetEntity } from './found-pet.entity';
import { LostPetEntity } from '../lost-pets/lost-pet.entity';
import { CreateFoundPetDto } from './dto/create-found-pet.dto';
import { MailService } from '../notifications/mail.service';
import { toPoint } from '../common/geo/geo.utils';
import { buildStaticMapUrl } from '../notifications/mapbox.static';
import {
  CACHE_FOUND_PETS_ALL,
  CACHE_LOST_PETS_ACTIVE,
} from '../common/cache/cache-keys';
import { logger } from '../config/logger';

type LostPetMatch = LostPetEntity & { distance: number };

@Injectable()
export class FoundPetsService {
  constructor(
    @InjectRepository(FoundPetEntity)
    private foundRepo: Repository<FoundPetEntity>,
    @InjectRepository(LostPetEntity)
    private lostRepo: Repository<LostPetEntity>,
    private mail: MailService,
    private config: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  async findAll(): Promise<FoundPetEntity[]> {
    const rows = await this.foundRepo.find({ order: { created_at: 'DESC' } });
    logger.info('Listado de mascotas encontradas', { count: rows.length });
    return rows;
  }

  async create(dto: CreateFoundPetDto) {
    logger.info('Registro de mascota encontrada iniciado', {
      species: dto.species,
      lng: dto.lng,
      lat: dto.lat,
    });
    const found = this.foundRepo.create({
      species: dto.species,
      breed: dto.breed,
      color: dto.color,
      size: dto.size,
      description: dto.description,
      photo_url: dto.photo_url,
      finder_name: dto.finder_name,
      finder_email: dto.finder_email,
      finder_phone: dto.finder_phone,
      address: dto.address,
      found_date: dto.found_date,
      location: toPoint({ lng: dto.lng, lat: dto.lat }),
    });
    await this.foundRepo.save(found);
    logger.info('Mascota encontrada guardada', { id: found.id });

    const matches = await this.findLostPetsWithinRadius({
      lng: dto.lng,
      lat: dto.lat,
      radiusMeters: 500,
    });
    logger.info('Coincidencias perdidas en radio', {
      radiusMeters: 500,
      count: matches.length,
    });

    await this.notify(matches, found);

    await this.cache.del(CACHE_FOUND_PETS_ALL);
    await this.cache.del(CACHE_LOST_PETS_ACTIVE);
    logger.info('Caché invalidada tras registro encontrada', {
      keys: [CACHE_FOUND_PETS_ALL, CACHE_LOST_PETS_ACTIVE],
    });

    logger.info('Registro de mascota encontrada finalizado', {
      foundPetId: found.id,
      matchesCount: matches.length,
    });

    return {
      message: 'Mascota encontrada registrada correctamente',
      matchesCount: matches.length,
    };
  }
// final 
  private async findLostPetsWithinRadius(params: {
    lng: number;
    lat: number;
    radiusMeters: number;
  }) {
    const pointGeog = `ST_SetSRID(ST_MakePoint(:lng,:lat),4326)::geography`;
    const qb = this.lostRepo.createQueryBuilder('lost');

    const rows = await qb
      .addSelect(`ST_Distance(lost.location, ${pointGeog})`, 'distance')
      .where('lost.is_active = true')
      .andWhere(`ST_DWithin(lost.location, ${pointGeog}, :radiusMeters)`)
      .setParameters({
        lng: params.lng,
        lat: params.lat,
        radiusMeters: params.radiusMeters,
      })
      .orderBy('distance', 'ASC')
      .getRawAndEntities();

    const result = rows.entities.map((e, i) => ({
      ...e,
      distance: Number((rows.raw[i] as { distance: string | number }).distance),
    })) as LostPetMatch[];

    logger.info('Búsqueda PostGIS ST_DWithin completada', {
      lng: params.lng,
      lat: params.lat,
      radiusMeters: params.radiusMeters,
      matches: result.length,
    });

    return result;
  }

  private async notify(matches: LostPetMatch[], found: FoundPetEntity) {
    if (!matches.length) {
      logger.info('Sin coincidencias en radio para notificar', {
        foundPetId: found.id,
      });
      return;
    }

    logger.info('Inicio notificaciones por coincidencia', {
      foundPetId: found.id,
      matches: matches.length,
    });
    const genericTo = this.config.get<string>('NOTIFY_EMAIL');
    const accessToken = this.config.get<string>('MAPBOX_TOKEN');
    const defaultGeneric = this.config.get<string>('MAILER_EMAIL');

    for (const lost of matches) {
      const to: string =
        genericTo ?? defaultGeneric ?? lost.owner_email ?? 'elenaespri@gmail.com';

      const mapUrl = accessToken
        ? buildStaticMapUrl({
            accessToken,
            lost: {
              lng: (lost.location as { coordinates: number[] }).coordinates[0],
              lat: (lost.location as { coordinates: number[] }).coordinates[1],
            },
            found: {
              lng: (found.location as { coordinates: number[] }).coordinates[0],
              lat: (found.location as { coordinates: number[] }).coordinates[1],
            },
          })
        : '';

      const html = `<div>
        <h3>Mascota encontrada</h3>
        <p>Especie: ${found.species}</p>
        <p>Color: ${found.color}</p>
        <p>Descripción: ${found.description || ''}</p>
        <h3>Contacto</h3>
        <p>Nombre: ${found.finder_name}</p>
        <p>Tel: ${found.finder_phone}</p>
        <h3>Mascota perdida</h3>
        <p>Nombre: ${lost.name}</p>
        <p>Distancia: ${lost.distance.toFixed(0)} m</p>
        ${mapUrl ? `<img src="${mapUrl}" />` : ''}
      </div>`;

      try {
        await this.mail.sendMatchEmail({
          to,
          subject: `PetRadar: posible coincidencia (${found.species})`,
          html,
        });
        logger.info('Correo de coincidencia enviado', {
          to,
          lostPetId: lost.id,
          distanceM: lost.distance.toFixed(0),
        });
      } catch {}

      lost.is_active = false;
      await this.lostRepo.save(lost);
    }

    logger.info('Notificaciones por coincidencia finalizadas', {
      foundPetId: found.id,
      processed: matches.length,
    });
  }
}
