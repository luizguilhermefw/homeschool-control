import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { StudyPlansService } from './study-plans.service';
import { CreateStudyPlanDto, UpdateStudyPlanDto } from './dto/study-plan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('study-plans')
export class StudyPlansController {
  constructor(private readonly studyPlansService: StudyPlansService) {}

  @Post()
  create(@Body() createStudyPlanDto: CreateStudyPlanDto) {
    return this.studyPlansService.create(createStudyPlanDto);
  }

  @Get()
  findAll(@Query('studentId') studentId?: string) {
    return this.studyPlansService.findAll(studentId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studyPlansService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStudyPlanDto: UpdateStudyPlanDto) {
    return this.studyPlansService.update(id, updateStudyPlanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.studyPlansService.remove(id);
  }
}
