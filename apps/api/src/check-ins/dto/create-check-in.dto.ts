import { IsString, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum Mood {
  GREAT = 'GREAT',
  GOOD = 'GOOD',
  OKAY = 'OKAY',
  BAD = 'BAD',
  TERRIBLE = 'TERRIBLE',
}

export class CreateCheckInDto {
  @ApiProperty()
  @IsUUID()
  teamId: string;

  @ApiProperty()
  @IsString()
  today: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  yesterday?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  blockers?: string;

  @ApiProperty({ enum: Mood })
  @IsEnum(Mood)
  mood: Mood;
}
