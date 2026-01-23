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
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
} from "@nestjs/swagger"
import { ToolListResponseSwagger } from "./swagger/tool-list-response.swagger"
import { ErrorResponseSwagger } from "./swagger/error-response.swagger"
import { ToolHealthResponseSwagger } from "./swagger/tool-health.swagger"
import { ToolCreateBodySwagger } from "./swagger/tool-create-body.swagger"
import { ToolListItemSwagger } from "./swagger/tool-list-item.swagger"
import { ToolDetailResponseSwagger } from "./swagger/tool-detail-response.swagger"
import { ToolUsageMetricsSwagger } from "./swagger/tool-usage-metrics.swagger"
import { ToolUpdateBodySwagger } from "./swagger/tool-update-body.swagger"

@ApiTags("tools")
@ApiExtraModels(ErrorResponseSwagger, ToolListResponseSwagger, ToolListItemSwagger, ToolDetailResponseSwagger, ToolUsageMetricsSwagger)
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
  @ApiOperation({
    summary: "List tools",
    description: "List tools with optional filters, pagination and sorting.",
  })
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
  @ApiOperation({ summary: "Get tool details by id" })
  @ApiOkResponse({ type: ToolDetailResponseSwagger })
  @ApiBadRequestResponse({
    description: "Validation failed (id must be a number)",
    content: {
      "application/json": {
        schema: { $ref: getSchemaPath(ErrorResponseSwagger) },
        examples: {
          invalidId: {
            summary: "Invalid id",
            value: {
              error: "Validation failed",
              details: { id: "Value must be a number" },
            },
          },
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: "Tool not found",
    content: {
      "application/json": {
        schema: { $ref: getSchemaPath(ErrorResponseSwagger) },
        examples: {
          toolNotFound: {
            summary: "Not found",
            value: {
              error: "Tool not found",
              message: "Tool does not exist",
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
  @ApiOperation({ summary: "Create a new tool" })
  @ApiBody({ type: ToolCreateBodySwagger })
  @ApiCreatedResponse({ type: ToolListItemSwagger })
  @ApiBadRequestResponse({
    description: "Validation failed (invalid body)",
    content: {
      "application/json": {
        schema: { $ref: getSchemaPath(ErrorResponseSwagger) },
        examples: {
          missingName: {
            summary: "Missing required field",
            value: {
              error: "Validation failed",
              details: {
                name: "name should not be empty",
              },
            },
          },
          invalidCost: {
            summary: "Invalid monthly_cost format",
            value: {
              error: "Validation failed",
              details: {
                monthly_cost: "monthly_cost must be a number with max 2 decimals",
              },
            },
          },
        },
      },
    },
  })
  @ApiConflictResponse({
    description: "Conflict (tool name already exists)",
    content: {
      "application/json": {
        schema: { $ref: getSchemaPath(ErrorResponseSwagger) },
        examples: {
          duplicateName: {
            summary: "Duplicate tool name",
            value: {
              error: "Validation failed",
              details: {
                name: "Tool name must be unique",
              },
            },
          },
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: "Tool not found",
    content: {
      "application/json": {
        schema: { $ref: getSchemaPath(ErrorResponseSwagger) },
        examples: {
          toolNotFound: {
            summary: "Not found",
            value: {
              error: "Tool not found",
              message: "Tool does not exist",
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
  async createTool(@Body() dto: CreateToolDto) {
    return this.toolsService.createTool(dto)
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a tool" })
  @ApiBody({ type: ToolUpdateBodySwagger })
  @ApiOkResponse({ type: ToolListItemSwagger })
  @ApiBadRequestResponse({
    description: "Validation failed (invalid id or invalid body)",
    content: {
      "application/json": {
        schema: { $ref: getSchemaPath(ErrorResponseSwagger) },
        examples: {
          invalidId: {
            summary: "Invalid id",
            value: {
              error: "Validation failed",
              details: { id: "Value must be a number" },
            },
          },
          invalidBody: {
            summary: "Invalid body",
            value: {
              error: "Validation failed",
              details: {
                monthly_cost: "monthly_cost must be a number with max 2 decimals",
              },
            },
          },
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: "Tool not found",
    content: {
      "application/json": {
        schema: { $ref: getSchemaPath(ErrorResponseSwagger) },
        examples: {
          toolNotFound: {
            summary: "Not found",
            value: {
              error: "Tool not found",
              message: "Tool does not exist",
            },
          },
        },
      },
    },
  })
  @ApiConflictResponse({
    description: "Conflict (tool name must be unique)",
    content: {
      "application/json": {
        schema: { $ref: getSchemaPath(ErrorResponseSwagger) },
        examples: {
          duplicateName: {
            summary: "Duplicate name",
            value: {
              error: "Validation failed",
              details: { name: "Tool name must be unique" },
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
