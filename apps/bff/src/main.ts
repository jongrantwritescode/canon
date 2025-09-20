import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for frontend
  app.enableCors({
    origin: ['http://localhost:8080', 'http://web:8080'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  // No global prefix for HTMX compatibility
  
  await app.listen(3000);
  console.log('BFF server running on port 3000');
}
bootstrap();
