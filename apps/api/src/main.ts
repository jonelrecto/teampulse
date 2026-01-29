import { exec } from 'child_process';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function killPort(port: number) {
  const command =
    process.platform === 'win32'
      ? `netstat -ano | findstr :${port}`
      : `lsof -ti:${port} || fuser -k ${port}/tcp`;

  await new Promise<void>((resolve) => {
    exec(command, (error, stdout) => {
      if (error || !stdout.trim()) {
        console.log(`✅ Port ${port} appears to be free or could not be inspected.`);
        return resolve();
      }

      const lines = stdout.trim().split('\n');
      const pids = Array.from(
        new Set(
          lines
            .map((line) =>
              process.platform === 'win32'
                ? line.trim().split(/\s+/).pop()
                : line.trim()
            )
        )
      ).filter(Boolean) as string[];

      if (!pids.length) {
        console.log(`✅ No processes found on port ${port}.`);
        return resolve();
      }

      const killCommand =
        process.platform === 'win32'
          ? `taskkill /F ${pids.map((pid) => `/PID ${pid}`).join(' ')}`
          : `kill -9 ${pids.join(' ')}`;

      exec(killCommand, (killError) => {
        if (killError) {
          console.error(`❌ Failed to kill processes on port ${port}:`, killError.message);
        } else {
          console.log(`✅ Killed processes on port ${port}: ${pids.join(', ')}`);
        }
        resolve();
      });
    });
  });
}

async function startServer() {
  const app = await NestFactory.create(AppModule);

  // CORS configuration
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Team Pulse API')
    .setDescription('Async standup and check-in tool for remote teams')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = Number(process.env.API_PORT) || 3001;

  try {
    await app.listen(port);
  } catch (error: any) {
    if (error?.code === 'EADDRINUSE') {
      console.error(
        `❌ Port ${port} is already in use. Attempting to free the port and retry...`
      );
      await killPort(port);

      // Small delay to give the OS time to release the port
      await new Promise((resolve) => setTimeout(resolve, 500));

      await app.listen(port);
    } else {
      throw error;
    }
  }

  console.log(`🚀 API server running on http://localhost:${port}`);
  console.log(`📚 Swagger docs available at http://localhost:${port}/api`);
}

async function bootstrap() {
  await startServer();
}

bootstrap();
