import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubjectDto, UpdateSubjectDto } from './dto/subject.dto';

@Injectable()
export class SubjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSubjectDto: CreateSubjectDto) {
    return this.prisma.client.subject.create({
      data: {
        name: createSubjectDto.name,
        color: createSubjectDto.color,
      } as any,
    });
  }

  async findAll() {
    return this.prisma.client.subject.findMany({
      orderBy: { name: 'asc' }
    });
  }

  async findOne(id: string) {
    const subject = await this.prisma.client.subject.findFirst({
      where: { id },
    });

    if (!subject) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }
    return subject;
  }

  async update(id: string, updateSubjectDto: UpdateSubjectDto) {
    await this.findOne(id);

    await this.prisma.client.subject.updateMany({
      where: { id },
      data: {
        name: updateSubjectDto.name,
        color: updateSubjectDto.color,
      },
    });

    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.client.subject.updateMany({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { success: true, message: 'Subject deleted successfully' };
  }
}
