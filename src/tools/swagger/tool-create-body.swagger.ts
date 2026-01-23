import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class ToolCreateBodySwagger {
  @ApiProperty({ example: "Notion", minLength: 2, maxLength: 100 })
  name: string

  @ApiProperty({ example: "Notion Labs", maxLength: 100 })
  vendor: string

  @ApiPropertyOptional({ example: "Collaborative workspace for teams" })
  description?: string

  @ApiPropertyOptional({ example: "https://www.notion.so" })
  website_url?: string

  @ApiProperty({ example: 12.5, minimum: 0 })
  monthly_cost: number

  @ApiProperty({ example: "Engineering" })
  owner_department: string

  @ApiProperty({ example: 1, minimum: 1 })
  category_id: number
}
