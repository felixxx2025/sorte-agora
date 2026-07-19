import { IsString, MinLength } from "class-validator";

export class CompleteMfaLoginDto {
  @IsString()
  mfaToken: string;

  @IsString()
  @MinLength(6)
  token: string;
}
