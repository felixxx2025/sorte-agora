import { Test, TestingModule } from '@nestjs/testing';
import { CacheService } from '../../common/services/cache.service';
import { PrismaService } from '../../database/prisma.service';
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SportsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: VipService, useValue: mockVipService },
        { provide: CacheService, useValue: mockCacheService },
      ],
    }).compile();

    service = module.get<SportsService>(SportsService);
    jest.clearAllMocks();
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
    });
  });
});
