import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../database/prisma.service";
import { AffiliatesService } from "../affiliates/affiliates.service";
import { FinancialService } from "./financial.service";
import { PIX_PROVIDER } from "./providers/pix-provider.interface";

describe("FinancialService", () => {
  let service: FinancialService;

  const mockPrismaService = {
    account: {
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    transaction: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      aggregate: jest.fn().mockResolvedValue({ _sum: { amount: 0 } }),
    },
    $transaction: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === "PIX_AUTO_CONFIRM") return "true";
      if (key === "NODE_ENV") return "test";
      return undefined;
    }),
  };

  const mockAffiliatesService = {
    recordCommission: jest.fn().mockResolvedValue(null),
  };

  const mockPixProvider = {
    name: "sandbox",
    createCharge: jest.fn().mockResolvedValue({
      externalId: "pix_test_1",
      pixCode: "PIXCODE",
      qrCode: "data:image/png;base64,xx",
      providerRef: "sandbox",
      expiresAt: new Date(),
    }),
    createPayout: jest.fn().mockResolvedValue({
      externalId: "payout_test_1",
      providerRef: "sandbox",
      status: "COMPLETED",
    }),
    parseWebhook: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinancialService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: AffiliatesService,
          useValue: mockAffiliatesService,
        },
        {
          provide: PIX_PROVIDER,
          useValue: mockPixProvider,
        },
      ],
    }).compile();

    service = module.get<FinancialService>(FinancialService);
    jest.clearAllMocks();
    mockPrismaService.user.findUnique.mockResolvedValue({
      referredById: null,
      selfExcludedUntil: null,
      deletedAt: null,
      isActive: true,
    });
    mockPrismaService.transaction.aggregate.mockResolvedValue({
      _sum: { amount: 0 },
    });
    mockPixProvider.createCharge.mockResolvedValue({
      externalId: "pix_test_1",
      pixCode: "PIXCODE",
      qrCode: "data:image/png;base64,xx",
      providerRef: "sandbox",
      expiresAt: new Date(),
    });
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getBalance", () => {
    it("should return user balance", async () => {
      const mockAccount = {
        id: "1",
        userId: "user1",
        balance: 1000,
        currency: "BRL",
        bonusBalance: 100,
        lockedBalance: 50,
      };

      mockPrismaService.account.findUnique.mockResolvedValue(mockAccount);

      const result = await service.getBalance("user1");

      expect(result).toBeDefined();
      expect(result.balance).toBe(1000);
      expect(result.bonusBalance).toBe(100);
      expect(result.lockedBalance).toBe(50);
      expect(mockPrismaService.account.findUnique).toHaveBeenCalledWith({
        where: { userId: "user1" },
      });
    });

    it("should throw NotFoundException when account missing", async () => {
      mockPrismaService.account.findUnique.mockResolvedValue(null);
      await expect(service.getBalance("user1")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("createDeposit", () => {
    it("should create a deposit and credit balance when auto-confirm is on", async () => {
      const mockAccount = {
        id: "1",
        userId: "user1",
        balance: 1000,
        currency: "BRL",
      };

      mockPrismaService.account.findUnique.mockResolvedValue(mockAccount);
      mockPrismaService.$transaction.mockImplementation(async (cb) =>
        cb({
          transaction: {
            create: jest.fn().mockResolvedValue({ id: "tx1" }),
          },
          account: {
            update: jest
              .fn()
              .mockResolvedValue({ ...mockAccount, balance: 1500 }),
          },
        }),
      );

      const result = await service.createDeposit("user1", { amount: 500 });

      expect(result).toHaveProperty("pixCode");
      expect(result).toHaveProperty("qrCode");
      expect(result.status).toBe("COMPLETED");
      expect(result.autoConfirmed).toBe(true);
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });

    it("should record affiliate commission when user was referred", async () => {
      const mockAccount = {
        id: "1",
        userId: "user1",
        balance: 1000,
        currency: "BRL",
      };

      mockPrismaService.account.findUnique.mockResolvedValue(mockAccount);
      mockPrismaService.user.findUnique.mockResolvedValue({
        referredById: "aff-user",
        selfExcludedUntil: null,
        deletedAt: null,
        isActive: true,
      });
      mockPrismaService.$transaction.mockImplementation(async (cb) =>
        cb({
          transaction: {
            create: jest.fn().mockResolvedValue({ id: "tx1" }),
          },
          account: {
            update: jest
              .fn()
              .mockResolvedValue({ ...mockAccount, balance: 1100 }),
          },
        }),
      );

      await service.createDeposit("user1", { amount: 100 });

      expect(mockAffiliatesService.recordCommission).toHaveBeenCalledWith({
        affiliateUserId: "aff-user",
        referredUserId: "user1",
        amount: 100,
        source: "DEPOSIT",
      });
    });
  });

  describe("createWithdraw", () => {
    it("should create a withdraw transaction with sufficient balance", async () => {
      const mockAccount = {
        id: "1",
        userId: "user1",
        balance: 1000,
        currency: "BRL",
      };

      mockPrismaService.account.findUnique.mockResolvedValue(mockAccount);
      mockPrismaService.$transaction.mockImplementation(async (cb) =>
        cb({
          transaction: {
            create: jest.fn().mockResolvedValue({ id: "tx-w1" }),
          },
          account: {
            update: jest.fn().mockResolvedValue(mockAccount),
          },
        }),
      );

      const result = await service.createWithdraw("user1", {
        amount: 500,
        pixKey: "test-pix-key",
      });

      expect(result).toHaveProperty("transactionId");
      expect(result.status).toBe("PENDING");
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });

    it("should throw error with insufficient balance", async () => {
      const mockAccount = {
        id: "1",
        userId: "user1",
        balance: 100,
        currency: "BRL",
      };

      mockPrismaService.account.findUnique.mockResolvedValue(mockAccount);

      await expect(
        service.createWithdraw("user1", {
          amount: 500,
          pixKey: "test-pix-key",
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("confirmByExternalId", () => {
    it("is idempotent when already COMPLETED", async () => {
      mockPrismaService.transaction.findFirst.mockResolvedValue({
        id: "tx1",
        userId: "u1",
        accountId: "a1",
        amount: 50,
        status: "COMPLETED",
        externalId: "pix_abc",
      });

      const result = await service.confirmByExternalId("pix_abc");
      expect(result.idempotent).toBe(true);
      expect(result.status).toBe("COMPLETED");
      expect(mockPrismaService.$transaction).not.toHaveBeenCalled();
    });

    it("credits PENDING deposit via webhook path", async () => {
      mockPrismaService.transaction.findFirst.mockResolvedValue({
        id: "tx1",
        userId: "u1",
        accountId: "a1",
        amount: 50,
        status: "PENDING",
        externalId: "pix_abc",
      });
      mockPrismaService.$transaction.mockImplementation(async (cb) =>
        cb({
          transaction: {
            update: jest.fn().mockResolvedValue({
              id: "tx1",
              externalId: "pix_abc",
              status: "COMPLETED",
            }),
          },
          account: {
            update: jest.fn().mockResolvedValue({ balance: 1050 }),
          },
        }),
      );

      const result = await service.confirmByExternalId("pix_abc");
      expect(result.status).toBe("COMPLETED");
      expect(result.idempotent).toBe(false);
    });
  });

  describe("approveWithdrawal", () => {
    it("completes payout via sandbox provider", async () => {
      mockPrismaService.transaction.findUnique.mockResolvedValue({
        id: "w1",
        userId: "u1",
        accountId: "a1",
        amount: 100,
        type: "WITHDRAWAL",
        status: "PENDING",
        pixKey: "user@pix",
      });
      mockPrismaService.$transaction.mockImplementation(async (cb) =>
        cb({
          transaction: { update: jest.fn().mockResolvedValue({}) },
          account: { update: jest.fn().mockResolvedValue({}) },
        }),
      );

      const result = await service.approveWithdrawal("w1");
      expect(result.status).toBe("COMPLETED");
      expect(mockPixProvider.createPayout).toHaveBeenCalled();
    });

    it("marks PROCESSING when provider is async", async () => {
      mockPixProvider.createPayout.mockResolvedValueOnce({
        externalId: "payout_async",
        status: "PROCESSING",
      });
      mockPrismaService.transaction.findUnique.mockResolvedValue({
        id: "w1",
        userId: "u1",
        accountId: "a1",
        amount: 100,
        type: "WITHDRAWAL",
        status: "PENDING",
        pixKey: "user@pix",
      });
      mockPrismaService.transaction.update.mockResolvedValue({});

      const result = await service.approveWithdrawal("w1");
      expect(result.status).toBe("PROCESSING");
      expect(mockPrismaService.transaction.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: "PROCESSING" }),
        }),
      );
    });
  });
});
