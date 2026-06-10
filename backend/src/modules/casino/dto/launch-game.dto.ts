import { IsString } from 'class-validator';

export class LaunchGameDto {
  @IsString()
  userId: string;
}
