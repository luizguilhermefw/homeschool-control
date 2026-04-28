import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto, UpdateStudentDto } from './dto/student.dto';

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createStudentDto: CreateStudentDto) {
    // 1. Criação:
    // O PrismaService intercepta isso e injeta `data: { tenantId: '...' }` invisivelmente!
    return this.prisma.client.student.create({
      data: {
        name: createStudentDto.name,
        dateOfBirth: createStudentDto.dateOfBirth ? new Date(createStudentDto.dateOfBirth) : null,
      } as any,
    });
  }

  async findAll() {
    // 2. Leitura Múltipla:
    // O PrismaService injeta `where: { tenantId: '...', deletedAt: null }`
    return this.prisma.client.student.findMany();
  }

  async findOne(id: string) {
    // 3. Leitura Única Segura:
    // Usamos findFirst em vez de findUnique para permitir a injeção do tenantId e deletedAt: null no 'where'
    const student = await this.prisma.client.student.findFirst({
      where: { id },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    return student;
  }

  async update(id: string, updateStudentDto: UpdateStudentDto) {
    // 4. Atualização Segura:
    // Primeiro, usamos findOne para garantir que o registro existe e PERTENCE ao tenant atual.
    // Se o ID for de outro tenant, findOne lançará NotFoundException.
    await this.findOne(id);

    // Agora atualizamos de forma segura
    await this.prisma.client.student.updateMany({
      where: { id },
      data: {
        name: updateStudentDto.name,
        dateOfBirth: updateStudentDto.dateOfBirth ? new Date(updateStudentDto.dateOfBirth) : undefined,
      },
    });

    return this.findOne(id);
  }

  async remove(id: string) {
    // 5. Deleção (Soft Delete):
    // Garantimos que o registro pertence ao tenant
    await this.findOne(id);

    // Preenchemos a data de exclusão
    await this.prisma.client.student.updateMany({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { success: true, message: 'Student deleted successfully' };
  }
}
