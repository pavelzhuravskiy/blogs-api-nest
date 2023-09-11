import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './exceptions/exception.filter';
import { customExceptionFactory } from './exceptions/exception.factory';
import { useContainer } from 'class-validator';
import cookieParser from 'cookie-parser';
import { TrimPipe } from './pipes/trim.pipe';
import * as ngrok from 'ngrok';
import { TelegramAdapter } from './api/infrastructure/telegram/telegram.adapter';

// Ngrok configuration
let appBaseUrl = process.env.APP_BASE_URL || `http://localhost:5000/`;

async function connectToNgrok() {
  return ngrok.connect(5000);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.enableCors();
  app.use(cookieParser());
  app.useGlobalPipes(
    new TrimPipe(),
    new ValidationPipe({
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: customExceptionFactory,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(5000);

  const telegramAdapter = await app.resolve(TelegramAdapter);

  // Ngrok connection
  if (process.env.NODE_ENV === 'development') {
    appBaseUrl = await connectToNgrok();
  }
  await telegramAdapter.setWebhook(
    appBaseUrl + '/integrations/telegram/webhook',
  );
  console.log('BASE URL:', appBaseUrl);
}
bootstrap();
