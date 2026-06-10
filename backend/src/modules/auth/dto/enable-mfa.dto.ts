import { IsString } from 'class-validator';

export class EnableMfaDto {
  @IsString()
  token: string;
}
