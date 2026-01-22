import { Injectable, NotFoundException } from "@nestjs/common"
import { PrismaService } from "src/prisma/prisma.service"

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

    // Calcul usage metrics sur 30 jours
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
}
