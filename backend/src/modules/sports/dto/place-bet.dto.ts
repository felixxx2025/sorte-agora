import { IsNumber, IsString, Min } from 'class-validator';

export class PlaceBetDto {
  @IsString()
  selectionId: string;

  @IsNumber()
  @Min(1)
  stake: number;
}
