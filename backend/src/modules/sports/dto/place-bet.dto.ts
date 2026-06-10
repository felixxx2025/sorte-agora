import { IsString, IsNumber, Min } from 'class-validator';

export class PlaceBetDto {
  @IsString()
  userId: string;

  @IsString()
  selectionId: string;

  @IsNumber()
  @Min(1)
  stake: number;
}
