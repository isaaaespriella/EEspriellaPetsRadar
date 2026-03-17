import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import type { Point } from 'geojson';
import { Repository } from 'typeorm';
import { toPoint } from '../common/geo/geo.utils';
import { MailService } from '../notifications/mail.service';
import { buildStaticMapUrl } from '../notifications/mapbox.static';
import { LostPetEntity } from '../lost-pets/lost-pet.entity';
import { CreateFoundPetDto } from './dto/create-found-pet.dto';
import { FoundPetEntity } from './found-pet.entity';

type LostPetMatch = LostPetEntity & { distance: number };

function pointToLngLat(p: Point) {
  return { lng: p.coordinates[0], lat: p.coordinates[1] };
}

@Injectable()
export class FoundPetsService {
  constructor(
    @InjectRepository(FoundPetEntity)
    private readonly foundRepo: Repository<FoundPetEntity>,
    @InjectRepository(LostPetEntity)
    private readonly lostRepo: Repository<LostPetEntity>,
    private readonly mail: MailService,
    private readonly config: ConfigService,
  ) {}

  async create(dto: CreateFoundPetDto) {
    const found = await this.foundRepo.save(
      this.foundRepo.create({
        species: dto.species,
        breed: dto.breed ?? null,
        color: dto.color,
        size: dto.size,
        description: dto.description,
        photoUrl: dto.photoUrl ?? null,
        finderName: dto.finderName,
        finderEmail: dto.finderEmail,
        finderPhone: dto.finderPhone,
        location: toPoint({ lng: dto.lng, lat: dto.lat }),
        address: dto.address,
        foundDate: dto.foundDate,
      }),
    );

    const matches = await this.findLostPetsWithinRadiusMeters({
      lng: dto.lng,
      lat: dto.lat,
      radiusMeters: 500,
    });

    await this.notify(matches, found);

    return { found, matchesCount: matches.length, matches };
  }

  async findLostPetsWithinRadiusMeters(params: {
    lng: number;
    lat: number;
    radiusMeters: number;
  }) {
    const pointGeog = `ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography`;
    const qb = this.lostRepo.createQueryBuilder('lost');

    const rows = await qb
      .addSelect(`ST_Distance(lost.location, ${pointGeog})`, 'distance')
      .where('lost.isActive = true')
      .andWhere(`ST_DWithin(lost.location, ${pointGeog}, :radiusMeters)`)
      .setParameters({
        lng: params.lng,
        lat: params.lat,
        radiusMeters: params.radiusMeters,
      })
      .orderBy('distance', 'ASC')
      .getRawAndEntities();

    return rows.entities.map((e, idx) => ({
      ...e,
      distance: Number((rows.raw[idx] as { distance: string | number }).distance),
    })) as LostPetMatch[];
  }

  private async notify(matches: LostPetMatch[], found: FoundPetEntity) {
    if (matches.length === 0) return;

    const genericTo = this.config.get<string>('NOTIFY_EMAIL');
    const accessToken = this.config.get<string>('MAPBOX_ACCESS_TOKEN');

    for (const lost of matches) {
      const to = genericTo || lost.ownerEmail;
      const lostLL = pointToLngLat(lost.location as Point);
      const foundLL = pointToLngLat(found.location as Point);
      const mapUrl =
        accessToken && accessToken.length > 0
          ? buildStaticMapUrl({
              accessToken,
              lost: lostLL,
              found: foundLL,
            })
          : '';

      const subject = `PetRadar: posible coincidencia (${found.species}) a ${(lost.distance).toFixed(
        0,
      )}m`;

      const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.4;">
          <h2>Posible coincidencia detectada</h2>
          <h3>Mascota encontrada</h3>
          <ul>
            <li><b>Especie</b>: ${escapeHtml(found.species)}</li>
            <li><b>Raza</b>: ${escapeHtml(found.breed ?? 'N/A')}</li>
            <li><b>Color</b>: ${escapeHtml(found.color)}</li>
            <li><b>Tamaño</b>: ${escapeHtml(found.size)}</li>
            <li><b>Descripción</b>: ${escapeHtml(found.description)}</li>
            <li><b>Dirección</b>: ${escapeHtml(found.address)}</li>
          </ul>
          <h3>Contacto de quien la encontró</h3>
          <ul>
            <li><b>Nombre</b>: ${escapeHtml(found.finderName)}</li>
            <li><b>Email</b>: ${escapeHtml(found.finderEmail)}</li>
            <li><b>Teléfono</b>: ${escapeHtml(found.finderPhone)}</li>
          </ul>
          <h3>Referencia de mascota perdida</h3>
          <ul>
            <li><b>Nombre</b>: ${escapeHtml(lost.name)}</li>
            <li><b>Especie</b>: ${escapeHtml(lost.species)}</li>
            <li><b>Raza</b>: ${escapeHtml(lost.breed)}</li>
            <li><b>Color</b>: ${escapeHtml(lost.color)}</li>
            <li><b>Tamaño</b>: ${escapeHtml(lost.size)}</li>
            <li><b>Dirección</b>: ${escapeHtml(lost.address)}</li>
            <li><b>Distancia</b>: ${lost.distance.toFixed(0)} m</li>
          </ul>
          ${
            mapUrl
              ? `<h3>Mapa</h3><img alt="Mapa" src="${mapUrl}" style="max-width: 100%; height: auto;" />`
              : ''
          }
        </div>
      `;

      await this.mail.sendMatchEmail({ to, subject, html });
    }
  }
}

function escapeHtml(input: string) {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

