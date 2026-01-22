import { Injectable } from "@nestjs/common"
import { PrismaService } from "prisma/prisma.service"

@Injectable()
export class ToolsService {
  constructor(private readonly prisma: PrismaService) {}

  async countTools(): Promise<number> {
    return this.prisma.tools.count()
  }
}
