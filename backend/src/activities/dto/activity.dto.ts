import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { ActivityStatus } from '@prisma/client';

export class CreateActivityDto {
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @IsUUID()
  @IsOptional()
  studyPlanItemId?: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsDateString()
  @IsNotEmpty()
  executionDate: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  realMinutes?: number;

  @IsEnum(ActivityStatus)
  @IsOptional()
  status?: ActivityStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateActivityDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsDateString()
  executionDate?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  realMinutes?: number;

  @IsOptional()
  @IsEnum(ActivityStatus)
  status?: ActivityStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
