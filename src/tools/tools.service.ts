import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common"
import { PrismaService } from "src/prisma/prisma.service"
import { CreateToolDto } from "./dto/create-tool.dto"

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

  // Business validations (DB-dependent) are handled here: unique name and existing category
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
}
