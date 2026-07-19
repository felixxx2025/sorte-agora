import { Type } from "class-transformer";
import { IsNumber, Max, Min } from "class-validator";

export class CrashBetDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0.5)
  @Max(10000)
  amount: number;
}
