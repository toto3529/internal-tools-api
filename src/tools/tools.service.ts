import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common"
import { PrismaService } from "src/prisma/prisma.service"
import { CreateToolDto } from "./dto/create-tool.dto"
import { UpdateToolDto } from "./dto/update-tool.dto"

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

  async updateTool(id: number, dto: UpdateToolDto) {
    const existingTool = await this.prisma.tools.findUnique({
      where: { id },
    })

    if (!existingTool) {
      throw new NotFoundException(`Tool with ID ${id} does not exist`)
    }

    // ✅ Unicité du name si modifié
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

    // ✅ category_id doit exister si fourni
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
}
