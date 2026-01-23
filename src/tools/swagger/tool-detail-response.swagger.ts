import { ApiProperty } from "@nestjs/swagger"
import { ToolListItemSwagger } from "./tool-list-item.swagger"
import { ToolUsageMetricsSwagger } from "./tool-usage-metrics.swagger"

export class ToolDetailResponseSwagger extends ToolListItemSwagger {
  @ApiProperty({ example: 250.0 })
  total_monthly_cost: number

  @ApiProperty({ type: ToolUsageMetricsSwagger })
  usage_metrics: ToolUsageMetricsSwagger
}
