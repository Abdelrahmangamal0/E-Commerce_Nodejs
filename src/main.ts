import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { LoggingInterceptor } from './common';
import * as express from 'express'


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ?? 3000
  app.enableCors()
  app.use('/order/webhook', express.raw({ type: "application/json" }))
 
 
  
  // app.use('/uploads', express.static(path.resolve('./uploads')))
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true
  }))
  // app.useGlobalInterceptors(new LoggingInterceptor())
  
  // main.ts

const config = new DocumentBuilder()
  .setTitle('Project API')
  .setDescription('API documentation for Frontend Team')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);

  
  
  
  
  
  await app.listen(port, () => {
    console.log(`You are connected with the Server on port ::: ${port} 🚀 `);
  })
}
bootstrap();
