import { Test, TestingModule } from "@nestjs/testing";
import { AuditService } from "./audit.service";
import { PrismaService } from "../../database/prisma.service";

describe("AuditService", () => {
  let service: AuditService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    auditLog: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("logAction", () => {
    it("should log an action", async () => {
      mockPrismaService.auditLog.create.mockResolvedValue({});

      await service.logAction("user1", "LOGIN", "USER", {
        email: "test@example.com",
      });

      expect(mockPrismaService.auditLog.create).toHaveBeenCalledWith({
        data: {
          userId: "user1",
          action: "LOGIN",
          entity: "USER",
          metadata: { email: "test@example.com" },
        },
      });
    });
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

      mockPrismaService.auditLog.findMany.mockResolvedValue(mockLogs);

      const result = await service.getUserLogs("user1");

      expect(result).toHaveLength(2);
      expect(mockPrismaService.auditLog.findMany).toHaveBeenCalledWith({
        where: { userId: "user1" },
        orderBy: { createdAt: "desc" },
        take: 50,
      });
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

      mockPrismaService.auditLog.findMany.mockResolvedValue(mockLogs);

      const result = await service.getUserLogs("user1", 10);

      expect(result).toHaveLength(1);
      expect(mockPrismaService.auditLog.findMany).toHaveBeenCalledWith({
        where: { userId: "user1" },
        orderBy: { createdAt: "desc" },
        take: 10,
      });
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

      mockPrismaService.auditLog.findMany.mockResolvedValue(mockLogs);

      const result = await service.getLogsByAction("LOGIN");

      expect(result).toHaveLength(2);
      expect(mockPrismaService.auditLog.findMany).toHaveBeenCalledWith({
        where: { action: "LOGIN" },
        orderBy: { createdAt: "desc" },
        take: 50,
      });
    });
  });
});
