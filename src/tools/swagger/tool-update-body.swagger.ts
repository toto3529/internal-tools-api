import { ApiPropertyOptional } from "@nestjs/swagger"

export class ToolUpdateBodySwagger {
  @ApiPropertyOptional({ example: "Confluence", minLength: 2, maxLength: 100 })
  name?: string

  @ApiPropertyOptional({ example: "Updated description after renewal" })
  description?: string

  @ApiPropertyOptional({ example: "Atlassian", maxLength: 100 })
  vendor?: string

  @ApiPropertyOptional({ example: "https://www.alt.bzh" })
  website_url?: string

  @ApiPropertyOptional({ example: 7.0, minimum: 0 })
  monthly_cost?: number

  @ApiPropertyOptional({ example: "Engineering" })
  owner_department?: string

  @ApiPropertyOptional({ example: "deprecated" })
  status?: string

  @ApiPropertyOptional({ example: 2, minimum: 1 })
  category_id?: number
}
