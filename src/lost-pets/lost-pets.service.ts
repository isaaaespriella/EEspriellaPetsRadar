import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { toPoint } from '../common/geo/geo.utils';
import { CreateLostPetDto } from './dto/create-lost-pet.dto';
import { LostPetEntity } from './lost-pet.entity';
import { MailService } from '../notifications/mail.service';

@Injectable()
export class LostPetsService {
  constructor(
    @InjectRepository(LostPetEntity)
    private readonly lostPetRepository: Repository<LostPetEntity>, // 👈 repo correcto
  
    private readonly mailService: MailService, // 👈 mail bien inyectado
  ) {}
  async create(dto: CreateLostPetDto) {

  
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
  
    return { message: 'Mascota registrada y correo enviado' };
  }
}