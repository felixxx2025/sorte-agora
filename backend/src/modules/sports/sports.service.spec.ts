import { Test, TestingModule } from '@nestjs/testing';
import { CacheService } from '../../common/services/cache.service';
import { PrismaService } from '../../database/prisma.service';
import { AffiliatesService } from '../affiliates/affiliates.service';
import { VipService } from '../vip/vip.service';
import { SportsService } from './sports.service';

describe('SportsService', () => {
  let service: SportsService;

  const mockPrismaService = {
    sportsEvent: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    sportsBet: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    sportsSelection: {
      findUnique: jest.fn(),
    },
    account: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    transaction: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockVipService = {
    addProgress: jest.fn().mockResolvedValue(undefined),
  };

  const mockCacheService = {
    getJson: jest.fn().mockResolvedValue(null),
    setJson: jest.fn().mockResolvedValue(undefined),
    del: jest.fn(),
  };

  const mockAffiliatesService = {
    recordCommission: jest.fn().mockResolvedValue(null),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SportsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: VipService, useValue: mockVipService },
        { provide: CacheService, useValue: mockCacheService },
        { provide: AffiliatesService, useValue: mockAffiliatesService },
      ],
    }).compile();

    service = module.get<SportsService>(SportsService);
    jest.clearAllMocks();
    mockPrismaService.user.findUnique.mockResolvedValue({
      referredById: null,
      selfExcludedUntil: null,
      deletedAt: null,
      isActive: true,
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getEvents', () => {
    it('should return events', async () => {
      mockPrismaService.sportsEvent.findMany.mockResolvedValue([{ id: '1' }]);
      const result = await service.getEvents(false);
      expect(result).toHaveLength(1);
      expect(mockCacheService.setJson).toHaveBeenCalled();
    });
  });

  describe('settleBet', () => {
    it('should settle lost bet', async () => {
      mockPrismaService.sportsBet.findUnique.mockResolvedValue({
        id: 'b1',
        status: 'PENDING',
        stake: 10,
        odds: 2,
        userId: 'u1',
      });
      mockPrismaService.sportsBet.update.mockResolvedValue({
        id: 'b1',
        status: 'LOST',
      });

      const result = await service.settleBet('b1', 'LOST');
      expect(result.status).toBe('LOST');
      expect(mockAffiliatesService.recordCommission).not.toHaveBeenCalled();
    });

    it('should credit payout and record BET commission on WON', async () => {
      mockPrismaService.sportsBet.findUnique.mockResolvedValue({
        id: 'b1',
        status: 'PENDING',
        stake: 10,
        odds: 2,
        userId: 'u1',
      });
      mockPrismaService.user.findUnique.mockResolvedValue({ referredById: 'aff1' });
      mockPrismaService.$transaction.mockImplementation(async (cb) =>
        cb({
          sportsBet: {
            update: jest.fn().mockResolvedValue({ id: 'b1', status: 'WON', payout: 20 }),
          },
          account: {
            findUnique: jest.fn().mockResolvedValue({ id: 'acc1', userId: 'u1' }),
            update: jest.fn(),
          },
          transaction: {
            create: jest.fn(),
          },
        }),
      );

      const result = await service.settleBet('b1', 'WON');
      expect(result.status).toBe('WON');
      expect(mockAffiliatesService.recordCommission).toHaveBeenCalledWith({
        affiliateUserId: 'aff1',
        referredUserId: 'u1',
        amount: 20,
        source: 'BET',
      });
    });
  });
});
