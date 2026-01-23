import { ApiProperty } from "@nestjs/swagger"

export class ToolListItemSwagger {
  @ApiProperty()
  id: number

  @ApiProperty()
  name: string

  @ApiProperty({ required: false })
  description?: string

  @ApiProperty()
  vendor: string

  @ApiProperty({ required: false })
  website_url?: string

  @ApiProperty()
  category: string

  @ApiProperty()
  monthly_cost: number

  @ApiProperty()
  owner_department: string

  @ApiProperty()
  status: string

  @ApiProperty()
  active_users_count: number

  @ApiProperty({ example: "2025-07-28T10:00:00.000Z" })
  created_at: string

  @ApiProperty({ example: "2025-07-28T12:00:00.000Z" })
  updated_at: string
}
