import { IsIn, IsNumber, Max, Min } from 'class-validator';

export class RegisterAffiliateDto {
  @IsIn(['CPA', 'REVSHARE', 'REVENUE_SHARE', 'HYBRID'])
  commissionType: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  commissionRate: number;
}
