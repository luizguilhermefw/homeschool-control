import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudyPlanDto, UpdateStudyPlanDto } from './dto/study-plan.dto';

@Injectable()
export class StudyPlansService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createStudyPlanDto: CreateStudyPlanDto) {
    const student = await this.prisma.client.student.findFirst({
      where: { id: createStudyPlanDto.studentId },
    });
    if (!student) throw new NotFoundException('Student not found');

    const academicYear = await this.prisma.client.academicYear.findFirst({
      where: { id: createStudyPlanDto.academicYearId },
    });
    if (!academicYear) throw new NotFoundException('Academic Year not found');

    return this.prisma.client.studyPlan.create({
      data: {
        name: createStudyPlanDto.name,
        description: createStudyPlanDto.description,
        studentId: createStudyPlanDto.studentId,
        academicYearId: createStudyPlanDto.academicYearId,
      } as any,
    });
  }

  async findAll(studentId?: string) {
    const whereClause: any = {};
    if (studentId) {
      whereClause.studentId = studentId;
    }

    return this.prisma.client.studyPlan.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        student: { select: { id: true, name: true } },
        academicYear: { select: { id: true, name: true } }
      }
    });
  }

  async findOne(id: string) {
    const studyPlan = await this.prisma.client.studyPlan.findFirst({
      where: { id },
      include: {
        items: {
          where: { deletedAt: null },
          orderBy: { sequenceOrder: 'asc' },
          include: { subject: { select: { id: true, name: true, color: true } } }
        },
        student: { select: { id: true, name: true } },
        academicYear: { select: { id: true, name: true } }
      }
    });

    if (!studyPlan) {
      throw new NotFoundException(`Study Plan with ID ${id} not found`);
    }
    return studyPlan;
  }

  async update(id: string, updateStudyPlanDto: UpdateStudyPlanDto) {
    await this.findOne(id);

    await this.prisma.client.studyPlan.updateMany({
      where: { id },
      data: {
        name: updateStudyPlanDto.name,
        description: updateStudyPlanDto.description,
      },
    });

    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.client.studyPlan.updateMany({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { success: true, message: 'Study Plan deleted successfully' };
  }
}
