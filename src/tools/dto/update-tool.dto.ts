import { IsEnum, IsOptional } from "class-validator"
import { tools_status } from "@prisma/client"
import { CreateToolDto } from "./create-tool.dto"
import { PartialType } from "@nestjs/mapped-types"

export class UpdateToolDto extends PartialType(CreateToolDto) {
  @IsOptional()
  @IsEnum(tools_status)
  status?: tools_status
}
