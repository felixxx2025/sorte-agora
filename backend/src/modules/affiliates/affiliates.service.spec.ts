import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "../../database/prisma.service";
import { AffiliatesService } from "./affiliates.service";

describe("AffiliatesService", () => {
  let service: AffiliatesService;

  const mockPrisma = {
    affiliate: {
      findUnique: jest.fn(),
    },
    affiliateCommission: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AffiliatesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(AffiliatesService);
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("recordCommission", () => {
    it("returns null when affiliate profile missing", async () => {
      mockPrisma.affiliate.findUnique.mockResolvedValue(null);
      const result = await service.recordCommission({
        affiliateUserId: "aff1",
        referredUserId: "u1",
        amount: 100,
        source: "DEPOSIT",
      });
      expect(result).toBeNull();
      expect(mockPrisma.affiliateCommission.create).not.toHaveBeenCalled();
    });

    it("creates PENDING commission from rate", async () => {
      mockPrisma.affiliate.findUnique.mockResolvedValue({
        id: "a1",
        userId: "aff1",
        commissionRate: 10,
      });
      mockPrisma.affiliateCommission.create.mockResolvedValue({
        id: "c1",
        amount: 10,
        status: "PENDING",
        source: "DEPOSIT",
      });

      const result = await service.recordCommission({
        affiliateUserId: "aff1",
        referredUserId: "u1",
        amount: 100,
        source: "DEPOSIT",
      });

      expect(result).toMatchObject({ id: "c1", amount: 10 });
      expect(mockPrisma.affiliateCommission.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          affiliateId: "a1",
          referredUserId: "u1",
          amount: 10,
          status: "PENDING",
          source: "DEPOSIT",
        }),
      });
    });

    it("returns null when commission amount is zero", async () => {
      mockPrisma.affiliate.findUnique.mockResolvedValue({
        id: "a1",
        commissionRate: 0,
      });
      const result = await service.recordCommission({
        affiliateUserId: "aff1",
        referredUserId: "u1",
        amount: 100,
        source: "BET",
      });
      expect(result).toBeNull();
    });
  });

  describe("settlePendingCommissions", () => {
    it("marks PENDING as PAID", async () => {
      mockPrisma.affiliateCommission.updateMany.mockResolvedValue({ count: 3 });
      const result = await service.settlePendingCommissions("a1");
      expect(result).toEqual({ settled: 3, affiliateId: "a1" });
      expect(mockPrisma.affiliateCommission.updateMany).toHaveBeenCalledWith({
        where: { status: "PENDING", affiliateId: "a1" },
        data: expect.objectContaining({ status: "PAID" }),
      });
    });
  });

  describe("markCommissionPaid", () => {
    it("pays a PENDING commission", async () => {
      mockPrisma.affiliateCommission.findUnique.mockResolvedValue({
        id: "c1",
        status: "PENDING",
      });
      mockPrisma.affiliateCommission.update.mockResolvedValue({
        id: "c1",
        status: "PAID",
      });
      const result = await service.markCommissionPaid("c1");
      expect(result.status).toBe("PAID");
    });
  });
});
