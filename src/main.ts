import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.FRONTEND_URL?.split(','),
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  })

  const config = new DocumentBuilder()
    .setTitle('MundoDigital API')
    .setVersion('1.0')
    .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'x-api-key')
    .build();

  // Después de createDocument:
  const document = SwaggerModule.createDocument(app, config);

  // Agregar security global a todos los endpoints:
  document.security = [{ 'x-api-key': [] }];

  SwaggerModule.setup('api', app, document);
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    const openPaths = ['/api', '/api-json', '/api-yaml', '/auth/login'];
    if (openPaths.some(p => req.path.startsWith(p))) return next();
    
    const key = req.headers['x-api-key'];
    if (key !== process.env.API_KEY) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
  });
}

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
