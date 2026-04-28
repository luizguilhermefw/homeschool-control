import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Global() // Global para permitir que TenantMiddleware injete o JwtService com facilidade
@Module({
  imports: [
    JwtModule.register({
      secret: 'super-secret-key-123', // TODO: Mover para variável de ambiente
      signOptions: { expiresIn: '7d' }, // Login válido por 1 semana
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard],
  exports: [AuthService, JwtModule, JwtAuthGuard],
})
export class AuthModule {}
