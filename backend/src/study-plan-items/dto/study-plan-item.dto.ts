import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateStudyPlanItemDto {
  @IsUUID()
  @IsNotEmpty()
  studyPlanId: string;

  @IsUUID()
  @IsNotEmpty()
  subjectId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(1)
  @IsNotEmpty()
  sequenceOrder: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  estimatedMinutes?: number;
}

export class UpdateStudyPlanItemDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  sequenceOrder?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  estimatedMinutes?: number;
}
