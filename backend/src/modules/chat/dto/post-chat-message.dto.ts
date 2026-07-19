import { IsIn, IsString, MaxLength, MinLength } from "class-validator";

export class PostChatMessageDto {
  @IsIn(["global", "support"])
  room: string;

  @IsString()
  @MinLength(1)
  @MaxLength(280)
  body: string;
}
