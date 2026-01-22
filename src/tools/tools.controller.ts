import { BadRequestException, Body, Controller, Get, Param, ParseIntPipe, Post } from "@nestjs/common"
import { ToolsService } from "./tools.service"
import { CreateToolDto } from "./dto/create-tool.dto"

@Controller("tools")
export class ToolsController {
  constructor(private readonly toolsService: ToolsService) {}

  // Endpoint technique
  @Get("health")
  async healthCheck() {
    const count = await this.toolsService.countTools()
    return { tools_count: count }
  }

  // Custom ParseIntPipe to align validation error format with API standards
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

  // Note: uniqueness and category existence are validated in the service layer (business rules)
  @Post()
  async createTool(@Body() dto: CreateToolDto) {
    return this.toolsService.createTool(dto)
  }
}
