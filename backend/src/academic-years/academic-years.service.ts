import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAcademicYearDto, UpdateAcademicYearDto } from './dto/academic-year.dto';

@Injectable()
export class AcademicYearsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAcademicYearDto: CreateAcademicYearDto) {
    return this.prisma.client.academicYear.create({
      data: {
        name: createAcademicYearDto.name,
        startDate: new Date(createAcademicYearDto.startDate),
        endDate: new Date(createAcademicYearDto.endDate),
      } as any, // Bypass strict TS typing for injected tenantId by prisma extension
    });
  }

  async findAll() {
    return this.prisma.client.academicYear.findMany({
      orderBy: { startDate: 'desc' }
    });
  }

  async findOne(id: string) {
    const academicYear = await this.prisma.client.academicYear.findFirst({
      where: { id },
    });

    if (!academicYear) {
      throw new NotFoundException(`Academic Year with ID ${id} not found`);
    }
    return academicYear;
  }

  async update(id: string, updateAcademicYearDto: UpdateAcademicYearDto) {
    await this.findOne(id);

    const updateData: any = {};
    if (updateAcademicYearDto.name) updateData.name = updateAcademicYearDto.name;
    if (updateAcademicYearDto.startDate) updateData.startDate = new Date(updateAcademicYearDto.startDate);
    if (updateAcademicYearDto.endDate) updateData.endDate = new Date(updateAcademicYearDto.endDate);

    await this.prisma.client.academicYear.updateMany({
      where: { id },
      data: updateData,
    });

    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.client.academicYear.updateMany({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { success: true, message: 'Academic Year deleted successfully' };
  }
}
