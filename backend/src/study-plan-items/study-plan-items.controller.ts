import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { StudyPlanItemsService } from './study-plan-items.service';
import { CreateStudyPlanItemDto, UpdateStudyPlanItemDto } from './dto/study-plan-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('study-plan-items')
export class StudyPlanItemsController {
  constructor(private readonly studyPlanItemsService: StudyPlanItemsService) {}

  @Post()
  create(@Body() createStudyPlanItemDto: CreateStudyPlanItemDto) {
    return this.studyPlanItemsService.create(createStudyPlanItemDto);
  }

  @Get()
  findAll(@Query('studyPlanId') studyPlanId: string) {
    return this.studyPlanItemsService.findAll(studyPlanId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studyPlanItemsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStudyPlanItemDto: UpdateStudyPlanItemDto) {
    return this.studyPlanItemsService.update(id, updateStudyPlanItemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.studyPlanItemsService.remove(id);
  }
}
