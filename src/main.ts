import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
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
  app.use((req, res, next) => {
    console.log('PATH:', req.path);
    console.log('HEADERS:', req.headers['x-api-key']);
    console.log('ENV KEY:', process.env.API_KEY);
    
    const openPaths = ['/api', '/api-json', '/api-yaml'];
    if (openPaths.some(p => req.path.startsWith(p))) return next();
    
    const key = req.headers['x-api-key'];
    if (key !== process.env.API_KEY) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
  });

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
