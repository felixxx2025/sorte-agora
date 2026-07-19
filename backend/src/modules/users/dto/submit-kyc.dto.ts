import { IsIn, IsNotEmpty, IsString, MinLength } from "class-validator";

export class SubmitKycDto {
  @IsString()
  @IsIn(["CPF", "RG", "CNH", "PASSPORT"])
  documentType: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  documentNumber: string;

  /** URL ou data-URL do documento (Fase 2: storage S3 na Fase 3) */
  @IsString()
  @IsNotEmpty()
  documentFront: string;

  @IsString()
  @IsNotEmpty()
  selfie: string;
}
