import {
  IsString,
  IsEnum,
  IsInt,
  IsOptional,
  Min,
  Max,
  MinLength,
  MaxLength,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Mood } from '@prisma/client';
import { MAX_CHECK_IN_LENGTH, ENERGY_MIN, ENERGY_MAX } from '@team-pulse/shared';

export class CreateCheckInDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(MAX_CHECK_IN_LENGTH.YESTERDAY)
  yesterday: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(MAX_CHECK_IN_LENGTH.TODAY)
  today: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(MAX_CHECK_IN_LENGTH.BLOCKERS)
  blockers?: string;

  @ApiProperty({ enum: Mood })
  @IsEnum(Mood)
  mood: Mood;

  @ApiProperty({ minimum: ENERGY_MIN, maximum: ENERGY_MAX })
  @IsInt()
  @Min(ENERGY_MIN)
  @Max(ENERGY_MAX)
  energy: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  checkInDate?: string;
}
