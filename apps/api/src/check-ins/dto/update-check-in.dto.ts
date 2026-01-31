import { IsString, IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Mood } from '@prisma/client'; // Import from Prisma

export class UpdateCheckInDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  today?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  yesterday?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  blockers?: string;

  @ApiPropertyOptional({ enum: Mood })
  @IsOptional()
  @IsEnum(Mood)
  mood?: Mood;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  energy: number;
}
