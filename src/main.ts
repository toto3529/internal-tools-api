import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import { ValidationPipe } from "@nestjs/common"
import { PrismaExceptionFilter } from "./utils/exception-filters/prisma_exception.filter"
import { HttpExceptionFilter } from "./utils/exception-filters/http-exception.filter"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.enableShutdownHooks()

  app.setGlobalPrefix("api")

  const config = new DocumentBuilder()
    .setTitle("Internal Tools API")
    .setDescription("API for internal SaaS tools management")
    .setVersion("1.0")
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup("api/docs", app, document)

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )

  app.useGlobalFilters(new HttpExceptionFilter(), new PrismaExceptionFilter())

  const port = Number(process.env.PORT ?? 3000)
  await app.listen(port)

  console.log(`[API] Listening on http://localhost:${port}/api`)
  console.log(`[API] Swagger on http://localhost:${port}/api/docs`)
  console.log(`[API] Environment: ${process.env.NODE_ENV ?? "development"}`)
}

bootstrap()
