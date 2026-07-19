import {
  BadRequestException,
  Inject,
  Injectable,
} from "@nestjs/common";
import Redis from "ioredis";
import { PrismaService } from "../../database/prisma.service";

const ALLOWED_ROOMS = new Set(["global", "support"]);
const MAX_BODY = 280;
const RATE_LIMIT_WINDOW_SEC = 3;

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    @Inject("REDIS_CLIENT") private readonly redis: Redis,
  ) {}

  async listMessages(room: string, limit = 40) {
    this.assertRoom(room);
    const take = Math.min(Math.max(Number(limit) || 40, 1), 100);

    const messages = await this.prisma.chatMessage.findMany({
      where: { room },
      orderBy: { createdAt: "desc" },
      take,
      include: {
        user: { select: { id: true, firstName: true, email: true } },
      },
    });

    return messages.reverse().map((m) => ({
      id: m.id,
      room: m.room,
      body: m.body,
      createdAt: m.createdAt,
      user: {
        id: m.user.id,
        firstName: m.user.firstName,
        email: m.user.email,
      },
    }));
  }

  async postMessage(userId: string, room: string, body: string) {
    this.assertRoom(room);
    const text = (body || "").trim();
    if (!text) {
      throw new BadRequestException("Message body is empty");
    }
    if (text.length > MAX_BODY) {
      throw new BadRequestException(`Message max ${MAX_BODY} characters`);
    }

    const rateKey = `chat:rate:${userId}`;
    const set = await this.redis.set(
      rateKey,
      "1",
      "EX",
      RATE_LIMIT_WINDOW_SEC,
      "NX",
    );
    if (set !== "OK") {
      throw new BadRequestException("Slow down — wait a moment before sending");
    }

    const message = await this.prisma.chatMessage.create({
      data: { userId, room, body: text },
      include: {
        user: { select: { id: true, firstName: true, email: true } },
      },
    });

    return {
      id: message.id,
      room: message.room,
      body: message.body,
      createdAt: message.createdAt,
      user: {
        id: message.user.id,
        firstName: message.user.firstName,
        email: message.user.email,
      },
    };
  }

  private assertRoom(room: string) {
    if (!ALLOWED_ROOMS.has(room)) {
      throw new BadRequestException("Invalid room (use global or support)");
    }
  }
}
