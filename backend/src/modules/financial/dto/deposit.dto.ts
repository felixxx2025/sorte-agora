import { IsNumber, Min, IsString, IsOptional } from 'class-validator';

export class DepositDto {
  @IsNumber()
  @Min(10)
  amount: number;

  @IsString()
  @IsOptional()
  pixKey?: string;
}
