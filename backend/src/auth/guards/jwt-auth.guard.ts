import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { TenantContextService } from '../../tenant/tenant-context.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private tenantContext: TenantContextService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      throw new UnauthorizedException('Token não fornecido');
    }
    
    try {
      // 1. Verificação CRIPTOGRÁFICA real. Se falhar, cai no catch imediatamente.
      const payload = await this.jwtService.verifyAsync(token, {
        secret: 'super-secret-key-123'
      });
      
      // 2. Se a assinatura for válida, extraímos o tenantId CONFIÁVEL
      // e injetamos na bolha do ALS (que já foi aberta pelo Middleware)
      if (payload.tenantId) {
        this.tenantContext.setTenantId(payload.tenantId);
      }

      request['user'] = payload;
    } catch {
      throw new UnauthorizedException('Token inválido, corrompido ou expirado');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
