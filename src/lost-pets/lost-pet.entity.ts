import type { Point } from 'geojson';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'lost_pets' })
export class LostPetEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar' })
  species!: string;

  @Column({ type: 'varchar' })
  breed!: string;

  @Column({ type: 'varchar' })
  color!: string;

  @Column({ type: 'varchar' })
  size!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'varchar', nullable: true })
  photoUrl!: string | null;

  @Column({ type: 'varchar' })
  ownerName!: string;

  @Column({ type: 'varchar' })
  ownerEmail!: string;

  @Column({ type: 'varchar' })
  ownerPhone!: string;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  location!: Point;

  @Column({ type: 'varchar' })
  address!: string;

  @Column({ type: 'timestamp' })
  lostDate!: Date;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}

