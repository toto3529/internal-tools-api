import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Préfixe global /api
  app.setGlobalPrefix("api")

  // Swagger
  const config = new DocumentBuilder()
    .setTitle("Internal Tools API")
    .setDescription("API for internal SaaS tools management")
    .setVersion("1.0")
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup("api/docs", app, document)

  const port = 3000
  await app.listen(3000)

  console.log(` Swagger Docs : http://localhost:${port}/api/docs`)
}

bootstrap()
