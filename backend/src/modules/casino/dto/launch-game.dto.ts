import { IsNumber, IsOptional, Min } from 'class-validator';

export class LaunchGameDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  betAmount?: number;
}
