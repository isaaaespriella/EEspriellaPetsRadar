import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFoundPetDto {
  @IsString()
  @IsNotEmpty()
  species!: string;

  @IsOptional()
  @IsString()
  breed?: string;

  @IsString()
  @IsNotEmpty()
  color!: string;

  @IsString()
  @IsNotEmpty()
  size!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsOptional()
  @IsUrl()
  photoUrl?: string;

  @IsString()
  @IsNotEmpty()
  finderName!: string;

  @IsEmail()
  finderEmail!: string;

  @IsString()
  @IsNotEmpty()
  finderPhone!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat!: number;

  @IsString()
  @IsNotEmpty()
  address!: string;

  @Type(() => Date)
  foundDate!: Date;
}

