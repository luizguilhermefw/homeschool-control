import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TenantModule } from './tenant/tenant.module';
import { PrismaModule } from './prisma/prisma.module';
import { TenantMiddleware } from './tenant/tenant.middleware';
import { StudentsModule } from './students/students.module';
import { AuthModule } from './auth/auth.module';
import { AcademicYearsModule } from './academic-years/academic-years.module';
import { SubjectsModule } from './subjects/subjects.module';
import { StudyPlansModule } from './study-plans/study-plans.module';
import { StudyPlanItemsModule } from './study-plan-items/study-plan-items.module';
import { ActivitiesModule } from './activities/activities.module';

@Module({
  imports: [TenantModule, PrismaModule, AuthModule, StudentsModule, AcademicYearsModule, SubjectsModule, StudyPlansModule, StudyPlanItemsModule, ActivitiesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
