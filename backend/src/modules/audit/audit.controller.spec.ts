import { Test, TestingModule } from "@nestjs/testing";
import { JwtAuthGuard } from "../../common/guards/auth.guard";
import { AuditController } from "./audit.controller";
import { AuditService } from "./audit.service";

describe("AuditController", () => {
  let controller: AuditController;
  let auditService: AuditService;

  const mockAuditService = {
    logAction: jest.fn(),
    getUserLogs: jest.fn(),
    getLogsByAction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditController],
      providers: [
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuditController>(AuditController);
    auditService = module.get<AuditService>(AuditService);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getUserLogs", () => {
    it("should return user logs", async () => {
      const mockLogs = [
        {
          id: "1",
          userId: "user1",
          action: "LOGIN",
          entity: "USER",
          createdAt: new Date(),
        },
        {
          id: "2",
          userId: "user1",
          action: "LOGOUT",
          entity: "USER",
          createdAt: new Date(),
        },
      ];

      mockAuditService.getUserLogs.mockResolvedValue(mockLogs);

      const result = await controller.getUserLogs("user1");

      expect(result).toHaveLength(2);
      expect(mockAuditService.getUserLogs).toHaveBeenCalledWith("user1", 50);
    });

    it("should return user logs with custom limit", async () => {
      const mockLogs = [
        {
          id: "1",
          userId: "user1",
          action: "LOGIN",
          entity: "USER",
          createdAt: new Date(),
        },
      ];

      mockAuditService.getUserLogs.mockResolvedValue(mockLogs);

      const result = await controller.getUserLogs("user1", "10");

      expect(result).toHaveLength(1);
      expect(mockAuditService.getUserLogs).toHaveBeenCalledWith("user1", 10);
    });
  });

  describe("getLogsByAction", () => {
    it("should return logs by action", async () => {
      const mockLogs = [
        {
          id: "1",
          userId: "user1",
          action: "LOGIN",
          entity: "USER",
          createdAt: new Date(),
        },
        {
          id: "2",
          userId: "user2",
          action: "LOGIN",
          entity: "USER",
          createdAt: new Date(),
        },
      ];

      mockAuditService.getLogsByAction.mockResolvedValue(mockLogs);

      const result = await controller.getLogsByAction("LOGIN");

      expect(result).toHaveLength(2);
      expect(mockAuditService.getLogsByAction).toHaveBeenCalledWith(
        "LOGIN",
        50,
      );
    });
  });
});
