import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActivityDto, UpdateActivityDto } from './dto/activity.dto';

@Injectable()
export class ActivitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createActivityDto: CreateActivityDto) {
    const student = await this.prisma.client.student.findFirst({
      where: { id: createActivityDto.studentId },
    });
    if (!student) throw new NotFoundException('Student not found');

    if (createActivityDto.studyPlanItemId) {
      const planItem = await this.prisma.client.studyPlanItem.findFirst({
        where: { id: createActivityDto.studyPlanItemId },
      });
      if (!planItem) throw new NotFoundException('Study Plan Item not found');
    }

    return this.prisma.client.activity.create({
      data: {
        studentId: createActivityDto.studentId,
        studyPlanItemId: createActivityDto.studyPlanItemId,
        title: createActivityDto.title,
        executionDate: new Date(createActivityDto.executionDate),
        realMinutes: createActivityDto.realMinutes,
        status: createActivityDto.status || 'TODO',
        notes: createActivityDto.notes,
      } as any,
    });
  }

  async findAll(studentId?: string, date?: string) {
    const whereClause: any = {};
    if (studentId) whereClause.studentId = studentId;
    if (date) {
      // Basic filter for the same day
      const startDate = new Date(date);
      startDate.setUTCHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setUTCHours(23, 59, 59, 999);
      whereClause.executionDate = {
        gte: startDate,
        lte: endDate,
      };
    }

    return this.prisma.client.activity.findMany({
      where: whereClause,
      orderBy: { executionDate: 'desc' },
      include: {
        studyPlanItem: { select: { id: true, title: true, subject: { select: { name: true, color: true } } } }
      }
    });
  }

  async findOne(id: string) {
    const activity = await this.prisma.client.activity.findFirst({
      where: { id },
      include: {
        studyPlanItem: { select: { id: true, title: true, subject: { select: { name: true, color: true } } } }
      }
    });

    if (!activity) {
      throw new NotFoundException(`Activity with ID ${id} not found`);
    }
    return activity;
  }

  async update(id: string, updateActivityDto: UpdateActivityDto) {
    await this.findOne(id);

    const updateData: any = {};
    if (updateActivityDto.title !== undefined) updateData.title = updateActivityDto.title;
    if (updateActivityDto.executionDate !== undefined) updateData.executionDate = new Date(updateActivityDto.executionDate);
    if (updateActivityDto.realMinutes !== undefined) updateData.realMinutes = updateActivityDto.realMinutes;
    if (updateActivityDto.status !== undefined) updateData.status = updateActivityDto.status;
    if (updateActivityDto.notes !== undefined) updateData.notes = updateActivityDto.notes;

    await this.prisma.client.activity.updateMany({
      where: { id },
      data: updateData,
    });

    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.client.activity.updateMany({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { success: true, message: 'Activity deleted successfully' };
  }
}
