import { Controller, Get } from "@nestjs/common"
import { ToolsService } from "./tools.service"

@Controller("tools")
export class ToolsController {
  constructor(private readonly toolsService: ToolsService) {}

  @Get("health")
  async healthCheck() {
    const count = await this.toolsService.countTools()
    return { tools_count: count }
  }
}
