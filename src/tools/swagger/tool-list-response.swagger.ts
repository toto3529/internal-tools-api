import { ApiProperty } from "@nestjs/swagger"
import { ToolListItemSwagger } from "./tool-list-item.swagger"

export class ToolListResponseSwagger {
  @ApiProperty({ type: [ToolListItemSwagger] })
  data: ToolListItemSwagger[]

  @ApiProperty({ example: 25 })
  total: number

  @ApiProperty({ example: 7 })
  filtered: number

  @ApiProperty({
    example: { department: "Engineering", status: "active" },
  })
  filters_applied: Record<string, unknown>
}
