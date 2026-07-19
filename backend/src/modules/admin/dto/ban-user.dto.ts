import { IsString } from "class-validator";

export class BanUserDto {
  @IsString()
  reason: string;
}
