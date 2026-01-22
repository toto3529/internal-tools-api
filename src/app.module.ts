import { Module } from "@nestjs/common"
import { PrismaModule } from "src/prisma/prisma.module"
import { ToolsModule } from "./tools/tools.module"

@Module({
  imports: [PrismaModule, ToolsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
