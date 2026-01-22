import { BadRequestException, Controller, Get, Param, ParseIntPipe } from "@nestjs/common"
import { ToolsService } from "./tools.service"

@Controller("tools")
export class ToolsController {
  constructor(private readonly toolsService: ToolsService) {}

  // Endpoint technique
  @Get("health")
  async healthCheck() {
    const count = await this.toolsService.countTools()
    return { tools_count: count }
  }

  // GET /api/tools/:id
  @Get(":id")
  async getToolById(
    @Param(
      "id",
      new ParseIntPipe({
        exceptionFactory: () =>
          new BadRequestException({
            error: "Validation failed",
            details: { id: "Value must be a number" },
          }),
      }),
    )
    id: number,
  ) {
    return this.toolsService.getToolById(id)
  }
}
