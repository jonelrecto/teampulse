import { IsBoolean, IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DigestFrequency } from '@prisma/client';

export class UpdateNotificationPreferenceDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  reminderEnabled?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reminderTime?: string;

  @ApiProperty({ required: false, enum: DigestFrequency })
  @IsOptional()
  @IsEnum(DigestFrequency)
  digestFrequency?: DigestFrequency;
}
