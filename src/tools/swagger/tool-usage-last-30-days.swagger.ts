import { ApiProperty } from "@nestjs/swagger"

export class ToolUsageLast30DaysSwagger {
  @ApiProperty({ example: 120 })
  total_sessions: number

  @ApiProperty({ example: 14.2 })
  avg_session_minutes: number
}
