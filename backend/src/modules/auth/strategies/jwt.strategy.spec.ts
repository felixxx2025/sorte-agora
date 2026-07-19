import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { TokenBlacklistService } from "../../../common/services/token-blacklist.service";
import { PrismaService } from "../../../database/prisma.service";
import { JwtStrategy } from "./jwt.strategy";

describe("JwtStrategy", () => {
  let strategy: JwtStrategy;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === "JWT_SECRET") return "test-secret";
      return null;
    }),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
  };

  const mockTokenBlacklistService = {
    isBlacklisted: jest.fn().mockResolvedValue(false),
    addToBlacklist: jest.fn(),
  };

  const mockReq = {
    headers: { authorization: "Bearer mock-token" },
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: TokenBlacklistService,
          useValue: mockTokenBlacklistService,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    jest.clearAllMocks();
    mockTokenBlacklistService.isBlacklisted.mockResolvedValue(false);
  });

  it("should be defined", () => {
    expect(strategy).toBeDefined();
  });

  describe("validate", () => {
    it("should validate JWT payload", async () => {
      const payload = { sub: "user1", email: "test@example.com" };

      const mockUser = {
        id: "user1",
        email: "test@example.com",
        isActive: true,
        isBanned: false,
        account: { balance: 1000 },
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await strategy.validate(mockReq, payload);

      expect(result).toBeDefined();
      expect(result.id).toBe("user1");
      expect(result.email).toBe("test@example.com");
    });

    it("should throw UnauthorizedException for inactive user", async () => {
      const payload = { sub: "user1", email: "test@example.com" };

      const mockUser = {
        id: "user1",
        email: "test@example.com",
        isActive: false,
        isBanned: false,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(strategy.validate(mockReq, payload)).rejects.toThrow();
    });

    it("should throw UnauthorizedException for banned user", async () => {
      const payload = { sub: "user1", email: "test@example.com" };

      const mockUser = {
        id: "user1",
        email: "test@example.com",
        isActive: true,
        isBanned: true,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(strategy.validate(mockReq, payload)).rejects.toThrow();
    });

    it("should throw for blacklisted token", async () => {
      mockTokenBlacklistService.isBlacklisted.mockResolvedValue(true);
      await expect(
        strategy.validate(mockReq, { sub: "user1" }),
      ).rejects.toThrow();
    });
  });
});
