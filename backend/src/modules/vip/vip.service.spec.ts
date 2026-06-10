import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../database/prisma.service';
import { VipService } from './vip.service';

describe('VipService', () => {
  let service: VipService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    vipLevel: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    vipMission: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VipService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<VipService>(VipService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getVipStatus', () => {
    it('should return VIP status for user', async () => {
      const mockUser = {
        id: '1',
        vipPoints: 500,
        vipLevelId: 'level1',
        vipLevel: {
          id: 'level1',
          name: 'Bronze',
          level: 1,
          pointsRequired: 0,
          cashbackPercent: 5,
          bonusAmount: 100,
        },
      };

      const mockNextLevel = {
        id: 'level2',
        name: 'Silver',
        level: 2,
        pointsRequired: 1000,
        cashbackPercent: 10,
        bonusAmount: 200,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.vipLevel.findFirst.mockResolvedValue(mockNextLevel);

      const result = await service.getVipStatus('user1');

      expect(result).toBeDefined();
      expect(result.level).toBeDefined();
      expect(result.points).toBe(500);
    });
  });

  describe('getVipLevels', () => {
    it('should return all VIP levels', async () => {
      const mockLevels = [
        { id: 'level1', name: 'Bronze', level: 1, pointsRequired: 0 },
        { id: 'level2', name: 'Silver', level: 2, pointsRequired: 1000 },
      ];

      mockPrismaService.vipLevel.findMany.mockResolvedValue(mockLevels);

      const result = await service.getVipLevels();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Bronze');
    });
  });

  describe('getMissions', () => {
    it('should return VIP missions', async () => {
      const mockMissions = [
        { id: '1', title: 'Deposit 100', type: 'DAILY', reward: 50, target: 100 },
        { id: '2', title: 'Bet 500', type: 'WEEKLY', reward: 200, target: 500 },
      ];

      mockPrismaService.vipMission.findMany.mockResolvedValue(mockMissions);

      const result = await service.getMissions('user1');

      expect(result).toBeDefined();
      expect(result.daily).toBeDefined();
      expect(result.weekly).toBeDefined();
    });
  });
});
