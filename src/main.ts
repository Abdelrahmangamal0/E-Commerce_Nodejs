import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
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
  await app.listen(port, () => {
    console.log(`You are connected with the Server on port ::: ${port} 🚀 `);
  })
}
bootstrap();
