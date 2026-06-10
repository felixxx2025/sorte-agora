import { IsString, IsEnum, IsNumber } from 'class-validator';

export class RegisterAffiliateDto {
  @IsEnum(['CPA', 'REVENUE_SHARE', 'HYBRID'])
  commissionType: string;

  @IsNumber()
  commissionRate: number;
}
