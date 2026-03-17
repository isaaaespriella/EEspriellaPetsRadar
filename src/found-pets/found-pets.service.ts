import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { FoundPetEntity } from './found-pet.entity';
import { LostPetEntity } from '../lost-pets/lost-pet.entity';
import { CreateFoundPetDto } from './dto/create-found-pet.dto';
import { MailService } from '../notifications/mail.service';
import { toPoint } from '../common/geo/geo.utils';
import { buildStaticMapUrl } from '../notifications/mapbox.static';

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
  ) {}

  async create(dto: CreateFoundPetDto) {
    const found = this.foundRepo.create({
      ...dto,
      location: toPoint({ lng: dto.lng, lat: dto.lat }),
    });
    await this.foundRepo.save(found);

    const matches = await this.findLostPetsWithinRadius({
      lng: dto.lng,
      lat: dto.lat,
      radiusMeters: 500,
      species: dto.species,
    });

    console.log('Matches found for this pet:', matches.map(m => m.name));

    await this.notify(matches, found);

    return {
      message: 'Mascota encontrada registrada correctamente',
      matchesCount: matches.length,
    };
  }

  private async findLostPetsWithinRadius(params: {
    lng: number;
    lat: number;
    radiusMeters: number;
    species: string;
  }) {
    const pointGeog = `ST_SetSRID(ST_MakePoint(:lng,:lat),4326)::geography`;
    const qb = this.lostRepo.createQueryBuilder('lost');

    const rows = await qb
      .addSelect(`ST_Distance(lost.location, ${pointGeog})`, 'distance')
      .where('lost.is_active = true')
      .andWhere('lost.species = :species')
      .andWhere(`ST_DWithin(lost.location, ${pointGeog}, :radiusMeters)`)
      .setParameters({ ...params })
      .orderBy('distance', 'ASC')
      .getRawAndEntities();

    return rows.entities.map((e, i) => ({
      ...e,
      distance: Number((rows.raw[i] as any).distance),
    })) as LostPetMatch[];
  }

  private async notify(matches: LostPetMatch[], found: FoundPetEntity) {
    if (!matches.length) {
      console.log('No matching lost pets found.');
      return;
    }

    const genericTo = this.config.get<string>('NOTIFY_EMAIL');
    const accessToken = this.config.get<string>('MAPBOX_TOKEN');
    const defaultGeneric = this.config.get<string>('MAILER_EMAIL');

    for (const lost of matches) {
      const to: string = lost.owner_email ?? genericTo ?? defaultGeneric ?? 'elenaespri@gmail.com';
      console.log('Preparing email to:', to);
      console.log('Lost pet:', lost.name, 'Distance:', lost.distance.toFixed(0), 'm');

      const mapUrl = accessToken
        ? buildStaticMapUrl({
            accessToken,
            lost: {
              lng: (lost.location as any).coordinates[0],
              lat: (lost.location as any).coordinates[1],
            },
            found: {
              lng: (found.location as any).coordinates[0],
              lat: (found.location as any).coordinates[1],
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
        console.log('Email sent successfully to:', to);
      } catch (err) {
        console.error('Email failed for:', to, err);
      }

      lost.is_active = false;
      await this.lostRepo.save(lost);
    }

    console.log('Finished notifying all matches.');
  }
}