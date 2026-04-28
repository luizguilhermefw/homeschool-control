import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilita CORS para permitir que o Frontend Vue (localhost:5173) faça requisições
  app.enableCors();

  // Habilita a validação global com class-validator
  app.useGlobalPipes(new ValidationPipe({ 
    whitelist: true, // Remove campos que não estão no DTO
    forbidNonWhitelisted: true, // Lança erro se enviar campos não mapeados
    transform: true // Converte os payloads para as instâncias das classes DTO
  }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
