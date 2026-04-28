import { Module } from '@nestjs/common';
import { StudyPlanItemsService } from './study-plan-items.service';
import { StudyPlanItemsController } from './study-plan-items.controller';

@Module({
  controllers: [StudyPlanItemsController],
  providers: [StudyPlanItemsService],
})
export class StudyPlanItemsModule {}
