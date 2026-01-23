import { IsString, IsNotEmpty, Length, IsOptional, IsUrl, IsNumber, Min, IsEnum, MaxLength, IsInt } from "class-validator"
import { Type } from "class-transformer"
import { tools_owner_department } from "@prisma/client"

export class CreateToolDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  name: string

  @IsOptional()
  @IsString()
  description?: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  vendor: string

  @IsOptional()
  @IsUrl()
  website_url?: string

  @Type(() => Number)
  @IsInt()
  @Min(1)
  category_id: number

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  monthly_cost: number

  @IsEnum(tools_owner_department)
  owner_department: tools_owner_department
}
