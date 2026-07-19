import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../database/prisma.service';
import { AffiliatesService } from './affiliates.service';

describe('AffiliatesService', () => {
  let service: AffiliatesService;

  const mockPrisma = {
    affiliate: {
      findUnique: jest.fn(),
    },
    affiliateCommission: {
      create: jest.fn(),
      findMany: jest.fn(),
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('recordCommission', () => {
    it('returns null when affiliate profile missing', async () => {
      mockPrisma.affiliate.findUnique.mockResolvedValue(null);
      const result = await service.recordCommission({
        affiliateUserId: 'aff1',
        referredUserId: 'u1',
        amount: 100,
        source: 'DEPOSIT',
      });
      expect(result).toBeNull();
      expect(mockPrisma.affiliateCommission.create).not.toHaveBeenCalled();
    });

    it('creates PENDING commission from rate', async () => {
      mockPrisma.affiliate.findUnique.mockResolvedValue({
        id: 'a1',
        userId: 'aff1',
        commissionRate: 10,
      });
      mockPrisma.affiliateCommission.create.mockResolvedValue({
        id: 'c1',
        amount: 10,
        status: 'PENDING',
        source: 'DEPOSIT',
      });

      const result = await service.recordCommission({
        affiliateUserId: 'aff1',
        referredUserId: 'u1',
        amount: 100,
        source: 'DEPOSIT',
      });

      expect(result).toMatchObject({ id: 'c1', amount: 10 });
      expect(mockPrisma.affiliateCommission.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          affiliateId: 'a1',
          referredUserId: 'u1',
          amount: 10,
          status: 'PENDING',
          source: 'DEPOSIT',
        }),
      });
    });

    it('returns null when commission amount is zero', async () => {
      mockPrisma.affiliate.findUnique.mockResolvedValue({
        id: 'a1',
        commissionRate: 0,
      });
      const result = await service.recordCommission({
        affiliateUserId: 'aff1',
        referredUserId: 'u1',
        amount: 100,
        source: 'BET',
      });
      expect(result).toBeNull();
    });
  });
});
