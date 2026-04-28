import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

export interface TenantContext {
  tenantId?: string;
  isSystem?: boolean;
}

@Injectable()
export class TenantContextService {
  private readonly als = new AsyncLocalStorage<TenantContext>();

  /**
   * Abre a bolha assíncrona limpa, sem nenhum tenant inicialmente.
   * Usado pelo Middleware para preparar o terreno.
   */
  runBlank<T>(callback: () => T): T {
    return this.als.run({}, callback);
  }

  /**
   * Executa em modo bypass (Sistema).
   */
  runAsSystem<T>(callback: () => T): T {
    return this.als.run({ isSystem: true }, callback);
  }

  /**
   * Injeta o tenantId no contexto atual. 
   * Só deve ser chamado por um Guard ou Interceptor APÓS validação estrita.
   */
  setTenantId(tenantId: string) {
    const store = this.als.getStore();
    if (store) {
      store.tenantId = tenantId;
    }
  }

  getTenantId(): string | undefined {
    return this.als.getStore()?.tenantId;
  }

  isSystem(): boolean {
    return this.als.getStore()?.isSystem ?? false;
  }
}
