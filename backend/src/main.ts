import { join } from 'path';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3003',
      'http://localhost:3004',
      'http://localhost:3005',
      'https://ai-booking-git-main-lahirushirant-gmailcoms-projects.vercel.app',
      'https://aivoice.lahirushiran.dev',
    ],
  });
  app.useBodyParser('urlencoded', { extended: false });
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.enableShutdownHooks();
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
