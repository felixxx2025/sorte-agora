import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "../auth.service";
import { LocalStrategy } from "./local.strategy";

describe("LocalStrategy", () => {
  let strategy: LocalStrategy;
  let authService: AuthService;

  const mockAuthService = {
    validateUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalStrategy,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    strategy = module.get<LocalStrategy>(LocalStrategy);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(strategy).toBeDefined();
  });

  describe("validate", () => {
    it("should validate user credentials", async () => {
      const mockUser = {
        id: "user1",
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
      };

      mockAuthService.validateUser.mockResolvedValue(mockUser);

      const result = await strategy.validate("test@example.com", "password123");

      expect(result).toBeDefined();
      expect(result.email).toBe("test@example.com");
      expect(mockAuthService.validateUser).toHaveBeenCalledWith(
        "test@example.com",
        "password123",
      );
    });

    it("should throw UnauthorizedException for invalid credentials", async () => {
      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(
        strategy.validate("test@example.com", "wrongpassword"),
      ).rejects.toThrow();
    });
  });
});
