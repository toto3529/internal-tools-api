import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common"
import { PrismaService } from "src/prisma/prisma.service"
import { CreateToolDto } from "./dto/create-tool.dto"
import { UpdateToolDto } from "./dto/update-tool.dto"
import { Prisma } from "@prisma/client"
import { ListToolsQueryDto, SortOrder, ToolsSortBy } from "./dto/list-tools.query.dto"

@Injectable()
export class ToolsService {
  constructor(private readonly prisma: PrismaService) {}

  async countTools(): Promise<number> {
    return this.prisma.tools.count()
  }

  async getToolById(id: number) {
    const tool = await this.prisma.tools.findUnique({
      where: { id },
      include: {
        categories: true,
      },
    })

    if (!tool) {
      throw new NotFoundException(`Tool with ID ${id} does not exist`)
    }

    const since = new Date()
    since.setDate(since.getDate() - 30)

    const usageAgg = await this.prisma.usage_logs.aggregate({
      where: {
        tool_id: id,
        session_date: { gte: since },
      },
      _count: { _all: true },
      _avg: { usage_minutes: true },
    })

    const totalMonthlyCost = Number(tool.monthly_cost) * tool.active_users_count

    return {
      id: tool.id,
      name: tool.name,
      description: tool.description,
      vendor: tool.vendor,
      website_url: tool.website_url,
      category: tool.categories.name,
      monthly_cost: Number(tool.monthly_cost),
      owner_department: tool.owner_department,
      status: tool.status,
      active_users_count: tool.active_users_count,
      total_monthly_cost: Number(totalMonthlyCost.toFixed(2)),
      created_at: tool.created_at,
      updated_at: tool.updated_at,
      usage_metrics: {
        last_30_days: {
          total_sessions: usageAgg._count._all ?? 0,
          avg_session_minutes: Math.round(usageAgg._avg.usage_minutes ?? 0),
        },
      },
    }
  }

  async createTool(dto: CreateToolDto) {
    const existing = await this.prisma.tools.findFirst({
      where: { name: dto.name },
    })

    if (existing) {
      throw new BadRequestException({
        error: "Validation failed",
        details: { name: "Tool name must be unique" },
      })
    }

    const category = await this.prisma.categories.findUnique({
      where: { id: dto.category_id },
    })

    if (!category) {
      throw new BadRequestException({
        error: "Validation failed",
        details: { category_id: "Category does not exist" },
      })
    }

    const tool = await this.prisma.tools.create({
      data: {
        name: dto.name,
        description: dto.description,
        vendor: dto.vendor,
        website_url: dto.website_url,
        category_id: dto.category_id,
        monthly_cost: dto.monthly_cost,
        owner_department: dto.owner_department,
        status: "active",
        active_users_count: 0,
      },
      include: {
        categories: true,
      },
    })

    return {
      id: tool.id,
      name: tool.name,
      description: tool.description,
      vendor: tool.vendor,
      website_url: tool.website_url,
      category: tool.categories.name,
      monthly_cost: Number(tool.monthly_cost),
      owner_department: tool.owner_department,
      status: tool.status,
      active_users_count: tool.active_users_count,
      created_at: tool.created_at,
      updated_at: tool.updated_at,
    }
  }

  async updateTool(id: number, dto: UpdateToolDto) {
    const existingTool = await this.prisma.tools.findUnique({
      where: { id },
    })

    if (!existingTool) {
      throw new NotFoundException(`Tool with ID ${id} does not exist`)
    }

    // Unicité du name si modifié
    if (dto.name && dto.name !== existingTool.name) {
      const nameExists = await this.prisma.tools.findFirst({
        where: { name: dto.name },
      })

      if (nameExists) {
        throw new BadRequestException({
          error: "Validation failed",
          details: { name: "Tool name must be unique" },
        })
      }
    }

    // Category_id doit exister si fourni
    if (dto.category_id !== undefined) {
      const category = await this.prisma.categories.findUnique({
        where: { id: dto.category_id },
      })

      if (!category) {
        throw new BadRequestException({
          error: "Validation failed",
          details: { category_id: "Category does not exist" },
        })
      }
    }

    const updatedTool = await this.prisma.tools.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.vendor !== undefined ? { vendor: dto.vendor } : {}),
        ...(dto.website_url !== undefined ? { website_url: dto.website_url } : {}),
        ...(dto.category_id !== undefined ? { category_id: dto.category_id } : {}),
        ...(dto.monthly_cost !== undefined ? { monthly_cost: dto.monthly_cost } : {}),
        ...(dto.owner_department !== undefined ? { owner_department: dto.owner_department } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        updated_at: new Date(),
      },
      include: {
        categories: true,
      },
    })

    return {
      id: updatedTool.id,
      name: updatedTool.name,
      description: updatedTool.description,
      vendor: updatedTool.vendor,
      website_url: updatedTool.website_url,
      category: updatedTool.categories.name,
      monthly_cost: Number(updatedTool.monthly_cost),
      owner_department: updatedTool.owner_department,
      status: updatedTool.status,
      active_users_count: updatedTool.active_users_count,
      created_at: updatedTool.created_at,
      updated_at: updatedTool.updated_at,
    }
  }

  async getTools(query: ListToolsQueryDto) {
    const { department, status, category, min_cost, max_cost, page = 1, limit = 20, sort_by = ToolsSortBy.DATE, order = SortOrder.DESC } = query

    if (min_cost !== undefined && max_cost !== undefined && min_cost > max_cost) {
      throw new BadRequestException({
        error: "Validation failed",
        details: {
          min_cost: "min_cost must be <= max_cost",
          max_cost: "max_cost must be >= min_cost",
        },
      })
    }

    const where: Prisma.toolsWhereInput = {
      ...(department ? { owner_department: department } : {}),
      ...(status ? { status } : {}),
      ...(min_cost !== undefined || max_cost !== undefined
        ? {
            monthly_cost: {
              ...(min_cost !== undefined ? { gte: min_cost } : {}),
              ...(max_cost !== undefined ? { lte: max_cost } : {}),
            },
          }
        : {}),
      ...(category
        ? {
            categories: {
              name: category,
            },
          }
        : {}),
    }

    const orderBy: Prisma.toolsOrderByWithRelationInput =
      sort_by === ToolsSortBy.NAME ? { name: order } : sort_by === ToolsSortBy.COST ? { monthly_cost: order } : { created_at: order }

    const skip = (page - 1) * limit

    const [total, filtered, tools] = await this.prisma.$transaction([
      this.prisma.tools.count(),
      this.prisma.tools.count({ where }),
      this.prisma.tools.findMany({
        where,
        include: { categories: true },
        orderBy,
        skip,
        take: limit,
      }),
    ])

    const filters_applied: Record<string, unknown> = {}
    if (department) filters_applied.department = department
    if (status) filters_applied.status = status
    if (category) filters_applied.category = category
    if (min_cost !== undefined) filters_applied.min_cost = min_cost
    if (max_cost !== undefined) filters_applied.max_cost = max_cost
    if (query.page !== undefined) filters_applied.page = page
    if (query.limit !== undefined) filters_applied.limit = limit
    if (query.sort_by !== undefined) filters_applied.sort_by = sort_by
    if (query.order !== undefined) filters_applied.order = order

    return {
      data: tools.map((tool) => ({
        id: tool.id,
        name: tool.name,
        description: tool.description,
        vendor: tool.vendor,
        website_url: tool.website_url,
        category: tool.categories.name,
        monthly_cost: Number(tool.monthly_cost),
        owner_department: tool.owner_department,
        status: tool.status,
        active_users_count: tool.active_users_count,
        created_at: tool.created_at,
        updated_at: tool.updated_at,
      })),
      total,
      filtered,
      filters_applied,
    }
  }
}
