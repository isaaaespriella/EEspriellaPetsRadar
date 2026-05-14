import { IsEmail, IsNotEmpty, IsOptional, IsString, IsNumber, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLostPetDto {
  @IsNotEmpty() @IsString() name: string;
  @IsNotEmpty() @IsString() species: string;
  @IsOptional() @IsString() breed?: string;
  @IsNotEmpty() @IsString() color: string;
  @IsNotEmpty() @IsString() size: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() photo_url?: string;
  @IsNotEmpty() @IsString() ownerName: string;
  @IsNotEmpty() @IsEmail() ownerEmail: string;
  @IsNotEmpty() @IsString() ownerPhone: string;
  @IsNotEmpty() @IsNumber() lng: number;
  @IsNotEmpty() @IsNumber() lat: number;
  @IsNotEmpty() @IsString() address: string;
  @IsNotEmpty() @Type(() => Date) @IsDate() lostDate: Date;
}