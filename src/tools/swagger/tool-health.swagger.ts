import { ApiProperty } from "@nestjs/swagger"

export class ToolHealthResponseSwagger {
  @ApiProperty({ example: 42 })
  tools_count: number
}
