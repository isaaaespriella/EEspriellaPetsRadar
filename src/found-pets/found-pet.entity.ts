import type { Point } from 'geojson';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'found_pets' })
export class FoundPetEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar' })
  species!: string;

  @Column({ type: 'varchar', nullable: true })
  breed!: string | null;

  @Column({ type: 'varchar' })
  color!: string;

  @Column({ type: 'varchar' })
  size!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'varchar', nullable: true })
  photoUrl!: string | null;

  @Column({ type: 'varchar' })
  finderName!: string;

  @Column({ type: 'varchar' })
  finderEmail!: string;

  @Column({ type: 'varchar' })
  finderPhone!: string;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  location!: Point;

  @Column({ type: 'varchar' })
  address!: string;

  @Column({ type: 'timestamp' })
  foundDate!: Date;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}

