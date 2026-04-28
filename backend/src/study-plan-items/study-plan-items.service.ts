import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudyPlanItemDto, UpdateStudyPlanItemDto } from './dto/study-plan-item.dto';

@Injectable()
export class StudyPlanItemsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createStudyPlanItemDto: CreateStudyPlanItemDto) {
    const studyPlan = await this.prisma.client.studyPlan.findFirst({
      where: { id: createStudyPlanItemDto.studyPlanId },
    });
    if (!studyPlan) throw new NotFoundException('Study Plan not found');

    const subject = await this.prisma.client.subject.findFirst({
      where: { id: createStudyPlanItemDto.subjectId },
    });
    if (!subject) throw new NotFoundException('Subject not found');

    return this.prisma.client.studyPlanItem.create({
      data: {
        studyPlanId: createStudyPlanItemDto.studyPlanId,
        subjectId: createStudyPlanItemDto.subjectId,
        title: createStudyPlanItemDto.title,
        description: createStudyPlanItemDto.description,
        sequenceOrder: createStudyPlanItemDto.sequenceOrder,
        estimatedMinutes: createStudyPlanItemDto.estimatedMinutes,
      } as any,
    });
  }

  async findAll(studyPlanId: string) {
    const studyPlan = await this.prisma.client.studyPlan.findFirst({
      where: { id: studyPlanId },
    });
    if (!studyPlan) throw new NotFoundException('Study Plan not found');

    return this.prisma.client.studyPlanItem.findMany({
      where: { studyPlanId },
      orderBy: { sequenceOrder: 'asc' },
      include: {
        subject: { select: { id: true, name: true, color: true } }
      }
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.client.studyPlanItem.findFirst({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException(`Study Plan Item with ID ${id} not found`);
    }
    return item;
  }

  async update(id: string, updateStudyPlanItemDto: UpdateStudyPlanItemDto) {
    await this.findOne(id);

    const updateData: any = {};
    if (updateStudyPlanItemDto.title !== undefined) updateData.title = updateStudyPlanItemDto.title;
    if (updateStudyPlanItemDto.description !== undefined) updateData.description = updateStudyPlanItemDto.description;
    if (updateStudyPlanItemDto.sequenceOrder !== undefined) updateData.sequenceOrder = updateStudyPlanItemDto.sequenceOrder;
    if (updateStudyPlanItemDto.estimatedMinutes !== undefined) updateData.estimatedMinutes = updateStudyPlanItemDto.estimatedMinutes;

    await this.prisma.client.studyPlanItem.updateMany({
      where: { id },
      data: updateData,
    });

    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.client.studyPlanItem.updateMany({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { success: true, message: 'Study Plan Item deleted successfully' };
  }
}
