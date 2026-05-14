import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('found_pets')
export class FoundPetEntity {
  @PrimaryGeneratedColumn() id: number;
  @Column() species: string;
  @Column({ nullable: true }) breed?: string;
  @Column() color: string;
  @Column() size: string;
  @Column({ nullable: true }) description?: string;
  @Column({ nullable: true }) photo_url?: string;
  @Column() finder_name: string;
  @Column() finder_email: string;
  @Column() finder_phone: string;
  @Column('geography', { spatialFeatureType: 'Point', srid: 4326 }) location: object;
@Column() address: string;
  @Column('timestamp') found_date: Date;
  @CreateDateColumn() created_at: Date;
  @UpdateDateColumn() updated_at: Date;
}