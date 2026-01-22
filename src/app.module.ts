import { Module } from "@nestjs/common"
import { AppController } from "./app.controller"
import { AppService } from "./app.service"
import { PrismaModule } from "prisma/prisma.module"
import { ToolsModule } from "./tools/tools.module"

@Module({
  imports: [PrismaModule, ToolsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
