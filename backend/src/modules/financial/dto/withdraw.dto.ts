import { IsNumber, Min, IsString } from "class-validator";

export class WithdrawDto {
  @IsNumber()
  @Min(20)
  amount: number;

  @IsString()
  pixKey: string;
}
