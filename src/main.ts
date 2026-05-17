import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use((req: any, res: any, next: any) => {
    const origin = req.headers.origin
    res.setHeader('Access-Control-Allow-Origin', origin || '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,x-api-key')
    res.setHeader('Access-Control-Allow-Credentials', 'true')

    if (req.method === 'OPTIONS') return res.status(204).end()

    if (process.env.NODE_ENV === 'production') {
      const openPaths = ['/api', '/api-json', '/api-yaml', '/auth/login']
      if (!openPaths.some(p => req.path.startsWith(p))) {
        const key = req.headers['x-api-key']
        if (key !== process.env.API_KEY) {
          return res.status(401).json({ message: 'Unauthorized' })
        }
      }
    }

    next()
  })

  const config = new DocumentBuilder()
    .setTitle('MundoDigital API')
    .setVersion('1.0')
    .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'x-api-key')
    .build()

  const document = SwaggerModule.createDocument(app, config)
  document.security = [{ 'x-api-key': [] }]
  SwaggerModule.setup('api', app, document)

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }))

  await app.listen(process.env.PORT ?? 3001)
}
bootstrap()