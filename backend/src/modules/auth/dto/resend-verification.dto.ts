import { IsEmail, IsOptional } from "class-validator";

export class ResendVerificationDto {
  @IsOptional()
  @IsEmail()
  email?: string;
}
