import { IsBoolean, IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DigestFrequency } from '@prisma/client'; // Import from Prisma

export class UpdateNotificationPreferenceDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  reminderEnabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reminderTime?: string;

  @ApiPropertyOptional({ enum: DigestFrequency })
  @IsOptional()
  @IsEnum(DigestFrequency)
  digestFrequency?: DigestFrequency;
}
