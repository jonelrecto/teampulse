import {
  IsString,
  IsEnum,
  IsInt,
  IsOptional,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Mood } from '@prisma/client';
import { MAX_CHECK_IN_LENGTH, ENERGY_MIN, ENERGY_MAX } from '@team-pulse/shared';
// ../../../../packages/shared/src/constants/check-in

export class UpdateCheckInDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(MAX_CHECK_IN_LENGTH.YESTERDAY)
  yesterday?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(MAX_CHECK_IN_LENGTH.TODAY)
  today?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(MAX_CHECK_IN_LENGTH.BLOCKERS)
  blockers?: string;

  @ApiProperty({ required: false, enum: Mood })
  @IsOptional()
  @IsEnum(Mood)
  mood?: Mood;

  @ApiProperty({ required: false, minimum: ENERGY_MIN, maximum: ENERGY_MAX })
  @IsOptional()
  @IsInt()
  @Min(ENERGY_MIN)
  @Max(ENERGY_MAX)
  energy?: number;
}
