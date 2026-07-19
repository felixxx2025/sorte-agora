import { Type } from "class-transformer";
import { IsInt, IsNumber, IsOptional, Min } from "class-validator";

export class ResponsibleGamingDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  depositLimitDaily?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  depositLimitWeekly?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  depositLimitMonthly?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  lossLimitDaily?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  lossLimitWeekly?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  lossLimitMonthly?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  sessionTimeLimitMinutes?: number;
}
