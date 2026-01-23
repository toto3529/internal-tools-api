import { BadRequestException, Body, Controller, Get, Param, ParseIntPipe, Post, Put, Query } from "@nestjs/common"
import { ToolsService } from "./tools.service"
import { CreateToolDto } from "./dto/create-tool.dto"
import { UpdateToolDto } from "./dto/update-tool.dto"
import { ListToolsQueryDto } from "./dto/list-tools.query.dto"
import {
  ApiTags,
  ApiQuery,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  getSchemaPath,
  ApiExtraModels,
  ApiOperation,
} from "@nestjs/swagger"
import { ToolListResponseSwagger } from "./swagger/tool-list-response.swagger"
import { ErrorResponseSwagger } from "./swagger/error-response.swagger"
import { ToolHealthResponseSwagger } from "./swagger/tool-health.swagger"

@ApiTags("tools")
@ApiExtraModels(ErrorResponseSwagger, ToolListResponseSwagger)
@Controller("tools")
export class ToolsController {
  constructor(private readonly toolsService: ToolsService) {}

  @Get("health")
  @ApiOperation({ summary: "Health check" })
  @ApiOkResponse({ type: ToolHealthResponseSwagger })
  async healthCheck() {
    const count = await this.toolsService.countTools()
    return { tools_count: count }
  }

  @Get()
  @ApiOkResponse({
    description: "List tools with filters, pagination and sorting",
    type: ToolListResponseSwagger,
  })
  @ApiBadRequestResponse({
    description: "Validation failed (invalid query parameters or business rules)",
    content: {
      "application/json": {
        schema: { $ref: getSchemaPath(ErrorResponseSwagger) },
        examples: {
          validationError: {
            summary: "Validation error",
            value: {
              error: "Validation failed",
              details: {
                min_cost: "min_cost must be <= max_cost",
                max_cost: "max_cost must be >= min_cost",
              },
            },
          },
        },
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: "Internal server error (database unavailable)",
    content: {
      "application/json": {
        schema: { $ref: getSchemaPath(ErrorResponseSwagger) },
        examples: {
          dbDown: {
            summary: "Database unavailable",
            value: {
              error: "Internal server error",
              message: "Database connection failed",
            },
          },
        },
      },
    },
  })
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
