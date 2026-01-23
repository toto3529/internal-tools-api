import { ApiProperty } from "@nestjs/swagger"
import { ToolUsageLast30DaysSwagger } from "./tool-usage-last-30-days.swagger"

export class ToolUsageMetricsSwagger {
  @ApiProperty({ type: ToolUsageLast30DaysSwagger })
  last_30_days: ToolUsageLast30DaysSwagger
}
