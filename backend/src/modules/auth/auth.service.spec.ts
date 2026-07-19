import { Test, TestingModule } from "@nestjs/testing";
import { UnauthorizedException, BadRequestException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";

import { TokenBlacklistService } from "../../common/services/token-blacklist.service";
import { MailService } from "../../common/services/mail.service";
import { CacheService } from "../../common/services/cache.service";
import { PrismaService } from "../../database/prisma.service";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";

describe("AuthService", () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn(),
    },
    account: {
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === "JWT_REFRESH_EXPIRES_IN") return "7d";
      if (key === "JWT_EXPIRES_IN") return "15m";
      if (key === "NODE_ENV") return "test";
      if (key === "FRONTEND_URL") return "http://localhost:3000";
      return "test-secret";
    }),
  };

  const mockTokenBlacklistService = {
    addToBlacklist: jest.fn().mockResolvedValue(undefined),
    isBlacklisted: jest.fn().mockResolvedValue(false),
    removeFromBlacklist: jest.fn().mockResolvedValue(undefined),
  };

  const mockMailService = {
    sendPasswordReset: jest
      .fn()
      .mockResolvedValue({ queued: false, mode: "log" }),
    sendMail: jest.fn().mockResolvedValue({ queued: false, mode: "log" }),
    isSmtpReady: jest.fn().mockReturnValue(false),
  };

  const mockCacheService = {
    getJson: jest.fn().mockResolvedValue(null),
    setJson: jest.fn().mockResolvedValue(undefined),
    del: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: TokenBlacklistService,
          useValue: mockTokenBlacklistService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("register", () => {
    it("should register a new user successfully", async () => {
      const registerDto: RegisterDto = {
        email: "test@example.com",
        password: "password123",
        firstName: "John",
        lastName: "Doe",
        dateOfBirth: "1990-01-15",
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: "1",
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
      });
      mockPrismaService.account.create.mockResolvedValue({});
      mockPrismaService.user.update.mockResolvedValue({});
      mockJwtService.sign.mockReturnValue("mock-token");

      const result = await service.register(registerDto);

      expect(result).toHaveProperty("user");
      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("message");
      expect(result.message).toBe("Registration successful");
      expect(mockPrismaService.user.create).toHaveBeenCalled();
      expect(mockPrismaService.account.create).toHaveBeenCalled();
    });
  });

  describe("validateUser", () => {
    it("should validate user with correct credentials", async () => {
      const mockUser = {
        id: "1",
        email: "test@example.com",
        password: await bcrypt.hash("password123", 12),
        isActive: true,
        isBanned: false,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.validateUser(
        "test@example.com",
        "password123",
      );

      expect(result).toBeDefined();
      expect(result.email).toBe("test@example.com");
      expect(result.password).toBeUndefined();
    });

    it("should return null for invalid email", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.validateUser(
        "wrong@example.com",
        "password123",
      );

      expect(result).toBeNull();
    });

    it("should return null for invalid password", async () => {
      const mockUser = {
        id: "1",
        email: "test@example.com",
        password: await bcrypt.hash("password123", 12),
        isActive: true,
        isBanned: false,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.validateUser(
        "test@example.com",
        "wrongpassword",
      );

      expect(result).toBeNull();
    });

    it("should throw UnauthorizedException for inactive user", async () => {
      const mockUser = {
        id: "1",
        email: "test@example.com",
        password: await bcrypt.hash("password123", 12),
        isActive: false,
        isBanned: false,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.validateUser("test@example.com", "password123"),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException for banned user", async () => {
      const mockUser = {
        id: "1",
        email: "test@example.com",
        password: await bcrypt.hash("password123", 12),
        isActive: true,
        isBanned: true,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.validateUser("test@example.com", "password123"),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("login", () => {
    it("should return access and refresh tokens", async () => {
      const mockUser = {
        id: "1",
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
        isActive: true,
        isBanned: false,
        mfaEnabled: false,
      };

      mockJwtService.sign.mockReturnValue("mock-token");
      mockPrismaService.user.update.mockResolvedValue({});

      const result = await service.login(mockUser);

      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
      expect(result).toHaveProperty("user");
      expect(mockJwtService.sign).toHaveBeenCalledTimes(2);
    });

    it("should require MFA when enabled", async () => {
      const mockUser = {
        id: "1",
        email: "test@example.com",
        isActive: true,
        isBanned: false,
        mfaEnabled: true,
      };
      mockJwtService.sign.mockReturnValue("mfa-temp");
      const result = await service.login(mockUser);
      expect(result.mfaRequired).toBe(true);
      expect(result).toHaveProperty("mfaToken");
      expect(result).not.toHaveProperty("accessToken");
    });
  });

  describe("logout", () => {
    it("should return logout message", async () => {
      const mockUser = { id: "1", email: "test@example.com" };

      const result = await service.logout(mockUser, "mock-token");

      expect(result).toHaveProperty("message");
      expect(result.message).toBe("Logout successful");
    });
  });

  describe("forgotPassword", () => {
    it("should return message for existing user", async () => {
      const mockUser = {
        id: "1",
        email: "test@example.com",
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({});

      const result = await service.forgotPassword({
        email: "test@example.com",
      });

      expect(result).toHaveProperty("message");
      expect(result.message).toContain("reset link");
    });

    it("should return message for non-existing user (security)", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.forgotPassword({
        email: "nonexistent@example.com",
      });

      expect(result).toHaveProperty("message");
      expect(result.message).toContain("reset link");
    });
  });

  describe("resetPassword", () => {
    it("should reset password with valid token", async () => {
      const mockUser = {
        id: "1",
        email: "test@example.com",
      };

      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({});

      const result = await service.resetPassword({
        token: "valid-token",
        newPassword: "newpassword123",
      });

      expect(result).toHaveProperty("message");
      expect(result.message).toBe("Password reset successfully");
    });

    it("should throw BadRequestException for invalid token", async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(
        service.resetPassword({
          token: "invalid-token",
          newPassword: "newpassword123",
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
