import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Mood } from './create-check-in.dto';

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
}
