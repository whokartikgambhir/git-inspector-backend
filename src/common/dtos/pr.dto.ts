// external dependencies
import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  Matches,
} from "class-validator";
import { Type } from "class-transformer";

const DEV_REPO_REGEX = /^[\w-]+$/;

export class GetPrsDto {
  @IsString()
  @Matches(DEV_REPO_REGEX, { message: "developer must be a valid GitHub login" })
  developer!: string;

  @IsOptional()
  @IsString()
  @Matches(DEV_REPO_REGEX, { message: "repo must be alphanumeric, dash or underscore" })
  repo?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: "page must be at least 1" })
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: "limit must be at least 1" })
  @Max(100, { message: "limit cannot exceed 100" })
  limit: number = 10;
}

export class GetMetricsDto extends GetPrsDto {
  // inherits developer + optional repo + page + limit
  // we can add other metric-specific fields in future here if needed
}
