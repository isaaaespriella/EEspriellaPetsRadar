import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('lost_pets')
export class LostPetEntity {
  @PrimaryGeneratedColumn() id: number;

  @Column() name: string;
  @Column() species: string;
  @Column({ nullable: true }) breed?: string;
  @Column() color: string;
  @Column() size: string;
  @Column({ nullable: true }) description?: string;
  @Column({ nullable: true }) photo_url?: string;

  @Column()
  owner_name: string;
  
  @Column()
  owner_email: string;
  
  @Column()
  owner_phone: string;

  @Column('geography', { spatialFeatureType: 'Point', srid: 4326 })
location: object;

  @Column() address: string;
  @Column('timestamp') lost_date: Date;

  @Column({ default: true }) is_active: boolean;

  @CreateDateColumn() created_at: Date;
  @UpdateDateColumn() updated_at: Date;
}