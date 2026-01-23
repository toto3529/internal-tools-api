import { BadRequestException, Body, Controller, Get, Param, ParseIntPipe, Post, Put, Query } from "@nestjs/common"
import { ToolsService } from "./tools.service"
import { CreateToolDto } from "./dto/create-tool.dto"
import { UpdateToolDto } from "./dto/update-tool.dto"
import { ListToolsQueryDto } from "./dto/list-tools.query.dto"
import { ApiTags, ApiQuery } from "@nestjs/swagger"

@ApiTags("tools")
@Controller("tools")
export class ToolsController {
  constructor(private readonly toolsService: ToolsService) {}

  // Endpoint technique
  @Get("health")
  async healthCheck() {
    const count = await this.toolsService.countTools()
    return { tools_count: count }
  }

  @Get()
  @ApiQuery({ name: "order", required: false, enum: ["asc", "desc"], example: "desc" })
  @ApiQuery({ name: "sort_by", required: false, enum: ["name", "cost", "date"], example: "date" })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 20 })
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "max_cost", required: false, type: Number, example: 50 })
  @ApiQuery({ name: "min_cost", required: false, type: Number, example: 10 })
  @ApiQuery({ name: "category", required: false, type: String, example: "Development" })
  @ApiQuery({ name: "status", required: false, enum: ["active", "deprecated", "trial"] })
  @ApiQuery({ name: "department", required: false, enum: ["Engineering", "Sales", "Marketing", "HR", "Finance", "Operations", "Design"] })
  async getTools(@Query() query: ListToolsQueryDto) {
    return this.toolsService.getTools(query)
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

  @Put(":id")
  async updateTool(
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
    @Body() dto: UpdateToolDto,
  ) {
    return this.toolsService.updateTool(id, dto)
  }
}
