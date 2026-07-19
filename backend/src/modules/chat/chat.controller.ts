import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  ServiceUnavailableException,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../common/decorators/user.decorator";
import { JwtAuthGuard } from "../../common/guards/auth.guard";
import { FeatureFlagsService } from "../../common/services/feature-flags.service";
import { ChatService } from "./chat.service";
import { PostChatMessageDto } from "./dto/post-chat-message.dto";

@ApiTags("chat")
@Controller("chat")
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private chatService: ChatService,
    private flags: FeatureFlagsService,
  ) {}

  private assertEnabled() {
    if (!this.flags.chat) {
      throw new ServiceUnavailableException("Chat is disabled");
    }
  }

  @Get("messages")
  listMessages(
    @Query("room") room = "global",
    @Query("limit") limit?: string,
  ) {
    this.assertEnabled();
    return this.chatService.listMessages(room, limit ? Number(limit) : 40);
  }

  @Post("messages")
  postMessage(@CurrentUser() user: any, @Body() dto: PostChatMessageDto) {
    this.assertEnabled();
    return this.chatService.postMessage(user.id, dto.room || "global", dto.body);
  }
}
