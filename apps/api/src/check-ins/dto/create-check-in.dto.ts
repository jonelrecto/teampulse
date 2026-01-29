import { IsString, IsOptional, IsEnum, IsUUID, IsInt, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Mood } from '@prisma/client'; // Import from Prisma

export class CreateCheckInDto {
  @ApiProperty()
  @IsUUID()
  teamId: string;

  @ApiProperty()
  @IsString()
  today: string;

  @ApiProperty()
  @IsString()
  yesterday: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  blockers?: string;

  @ApiProperty({ enum: Mood, enumName: 'Mood' })
  @IsEnum(Mood)
  mood: Mood;

  @ApiProperty({ minimum: 1, maximum: 10 })
  @IsInt()
  @Min(1)
  @Max(10)
  energy: number;
}