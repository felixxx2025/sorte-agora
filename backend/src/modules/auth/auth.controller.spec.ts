import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "../../common/guards/auth.guard";
import { ThrottlerGuard } from "@nestjs/throttler";

describe("AuthController", () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
    generateMfaSecret: jest.fn(),
    enableMfa: jest.fn(),
    disableMfa: jest.fn(),
    verifyMfa: jest.fn(),
    completeMfaLogin: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("register", () => {
    it("should register a new user", async () => {
      const registerDto = {
        email: "test@example.com",
        password: "password123",
        firstName: "John",
        lastName: "Doe",
        dateOfBirth: "1990-01-15",
      };

      mockAuthService.register.mockResolvedValue({
        user: { id: "1", email: "test@example.com" },
        message: "Registration successful",
      });

      const result = await controller.register(registerDto);

      expect(result).toHaveProperty("user");
      expect(result).toHaveProperty("message");
      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe("login", () => {
    it("should login user", async () => {
      const mockUser = { id: "1", email: "test@example.com" };
      const req = { user: mockUser };

      mockAuthService.login.mockResolvedValue({
        accessToken: "mock-token",
        refreshToken: "mock-refresh-token",
        user: mockUser,
      });

      const result = await controller.login(req, {} as any);

      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
      expect(mockAuthService.login).toHaveBeenCalledWith(mockUser);
    });
  });

  describe("logout", () => {
    it("should logout user", async () => {
      const mockUser = { id: "1", email: "test@example.com" };
      const req = {
        user: mockUser,
        headers: { authorization: "Bearer mock-token" },
      };

      mockAuthService.logout.mockResolvedValue({
        message: "Logout successful",
      });

      const result = await controller.logout(req);

      expect(result).toHaveProperty("message");
      expect(result.message).toBe("Logout successful");
    });
  });

  describe("forgotPassword", () => {
    it("should send password reset email", async () => {
      const forgotPasswordDto = { email: "test@example.com" };

      mockAuthService.forgotPassword.mockResolvedValue({
        message: "If the email exists, a reset link has been sent",
      });

      const result = await controller.forgotPassword(forgotPasswordDto);

      expect(result).toHaveProperty("message");
      expect(mockAuthService.forgotPassword).toHaveBeenCalledWith(
        forgotPasswordDto,
      );
    });
  });

  describe("resetPassword", () => {
    it("should reset password", async () => {
      const resetPasswordDto = {
        token: "valid-token",
        newPassword: "newpassword123",
      };

      mockAuthService.resetPassword.mockResolvedValue({
        message: "Password reset successfully",
      });

      const result = await controller.resetPassword(resetPasswordDto);

      expect(result).toHaveProperty("message");
      expect(result.message).toBe("Password reset successfully");
    });
  });
});
