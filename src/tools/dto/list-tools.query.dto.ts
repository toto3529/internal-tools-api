import { Type } from "class-transformer"
import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from "class-validator"
import { tools_owner_department, tools_status } from "@prisma/client"

export enum ToolsSortBy {
  NAME = "name",
  COST = "cost",
  DATE = "date",
}

export enum SortOrder {
  ASC = "asc",
  DESC = "desc",
}

export class ListToolsQueryDto {
  @IsOptional()
  @IsEnum(tools_owner_department)
  department?: tools_owner_department

  @IsOptional()
  @IsEnum(tools_status)
  status?: tools_status

  @IsOptional()
  @IsString()
  category?: string

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  min_cost?: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  max_cost?: number

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number

  @IsOptional()
  @IsEnum(ToolsSortBy)
  sort_by?: ToolsSortBy

  @IsOptional()
  @IsEnum(SortOrder)
  order?: SortOrder
}
