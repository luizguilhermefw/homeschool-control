import { Injectable, OnModuleInit, OnModuleDestroy, UnauthorizedException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { TenantContextService } from '../tenant/tenant-context.service';

export function createPrismaExtendedClient(tenantContext: TenantContextService) {
  return new PrismaClient().$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const scopedArgs = args as any;
          const tenantId = tenantContext.getTenantId();
          const isSystem = tenantContext.isSystem();
          
          const tenantModels = [
            'User', 'Student', 'AcademicYear', 'Subject', 
            'StudyPlan', 'StudyPlanItem', 'Activity', 'ProgressRecord'
          ];
          
          if (tenantModels.includes(model as string)) {
            if (isSystem) return query(args);

            if (!tenantId) {
              throw new UnauthorizedException(
                `CRÍTICO: Tentativa de operação '${operation}' na entidade '${model as string}' sem um Tenant (Família) definido ou Contexto de Sistema.`
              );
            }

            if (operation === 'create' || operation === 'createMany') {
              // Em caso de array (createMany), não é tão trivial mapear aqui na extensão simples,
              // mas para create unitário:
              if (scopedArgs.data && !Array.isArray(scopedArgs.data)) {
                scopedArgs.data = { ...scopedArgs.data, tenantId };
              }
            } else if (['findFirst', 'findFirstOrThrow', 'findMany', 'count', 'aggregate', 'groupBy'].includes(operation as string)) {
              // Aplica tenantId e remove os soft-deleted
              scopedArgs.where = { ...scopedArgs.where, tenantId, deletedAt: null };
            } else if (['updateMany', 'deleteMany'].includes(operation as string)) {
              // Para atualizações e deleções em massa, aplicamos a trava
              scopedArgs.where = { ...scopedArgs.where, tenantId, deletedAt: null };
            } else if (['update', 'delete', 'findUnique', 'findUniqueOrThrow'].includes(operation as string)) {
              // Prisma bloqueia injetar campos não-unique em operações do tipo 'Unique'.
              // Solução: O Service DEVE garantir que a entidade pertence ao tenant ou usar findFirst/updateMany.
              // Para evitar quebra do framework, não injetamos tenantId no where destas operações específicas aqui,
              // mas instruímos a conversão delas para 'findFirst' e 'updateMany' nos services.
            }
          }
          
          return query(args);
        }
      }
    }
  });
}

export type ExtendedPrismaClient = ReturnType<typeof createPrismaExtendedClient>;

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  public client: ExtendedPrismaClient;

  constructor(private readonly tenantContext: TenantContextService) {
    this.client = createPrismaExtendedClient(this.tenantContext);
  }

  async onModuleInit() {
    await (this.client as any).$connect();
  }

  async onModuleDestroy() {
    await (this.client as any).$disconnect();
  }
}
