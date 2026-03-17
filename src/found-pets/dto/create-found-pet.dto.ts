import { IsNotEmpty, IsOptional, IsString, IsNumber, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFoundPetDto {
  @IsNotEmpty() @IsString() species: string;
  @IsOptional() @IsString() breed?: string;
  @IsNotEmpty() @IsString() color: string;
  @IsNotEmpty() @IsString() size: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() photo_url?: string;
  @IsNotEmpty() @IsString() finder_name: string;
  @IsNotEmpty() @IsString() finder_phone: string;
  @IsNotEmpty() @IsString() finder_email: string;
  @IsNotEmpty() @IsNumber() lng: number;
  @IsNotEmpty() @IsNumber() lat: number;
  @IsNotEmpty() @IsString() address: string;
  @IsNotEmpty() @Type(() => Date) @IsDate() found_date: Date;
}