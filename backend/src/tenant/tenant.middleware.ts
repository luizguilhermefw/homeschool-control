import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantContextService } from './tenant-context.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly tenantContext: TenantContextService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Agora o Middleware é extremamente simples e seguro.
    // Ele NÂO lê o header de autenticação e NÃO confia em nada.
    // Apenas envelopa toda a requisição dentro do AsyncLocalStorage.
    // Qualquer Guard que vier a seguir poderá injetar dados dentro desta bolha segura.
    this.tenantContext.runBlank(() => {
      next();
    });
  }
}
