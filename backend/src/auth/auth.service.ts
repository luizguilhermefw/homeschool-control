import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { SignupDto, LoginDto } from './dto/auth.dto';
import { TenantContextService } from '../tenant/tenant-context.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly tenantContext: TenantContextService
  ) {}

  async signup(dto: SignupDto) {
    return this.tenantContext.runAsSystem(async () => {
      // REGRA: E-mail único GLOBAL.
      // Em SaaS modernos (como Notion, Slack, Registudy), o email atua como
      // identificador central da plataforma, facilitando o login sem perguntar
      // o nome do Workspace/Tenant antes.
      const existingUser = await this.prisma.client.user.findFirst({
        where: { email: dto.email }
      });

      if (existingUser) {
        throw new BadRequestException('Email already registered in the platform');
      }

      const passwordHash = await bcrypt.hash(dto.password, 10);

      const tenant = await this.prisma.client.tenant.create({
        data: {
          name: dto.familyName,
          users: {
            create: {
              name: dto.userName,
              email: dto.email,
              passwordHash,
              role: 'ADMIN'
            }
          }
        },
        include: { users: true }
      });

      const user = tenant.users[0];
      const payload = { userId: user.id, tenantId: tenant.id, role: user.role };
      const accessToken = await this.jwtService.signAsync(payload);

      return {
        accessToken,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        tenant: { id: tenant.id, name: tenant.name }
      };
    });
  }

  async login(dto: LoginDto) {
    return this.tenantContext.runAsSystem(async () => {
      // Como o email é globalmente único, achamos o usuário instantaneamente
      const user = await this.prisma.client.user.findFirst({
        where: { email: dto.email },
        include: { tenant: true }
      });

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload = { userId: user.id, tenantId: user.tenantId, role: user.role };
      const accessToken = await this.jwtService.signAsync(payload);

      return {
        accessToken,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        tenant: { id: user.tenant.id, name: user.tenant.name }
      };
    });
  }
}
