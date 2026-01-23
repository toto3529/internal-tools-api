import { ApiProperty } from "@nestjs/swagger"

export class ErrorResponseSwagger {
  @ApiProperty({ example: "Validation failed" })
  error: string

  @ApiProperty({ required: false })
  details?: Record<string, string>

  @ApiProperty({ required: false })
  message?: string
}
