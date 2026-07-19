import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../database/prisma.service';
import { VipService } from './vip.service';

describe('VipService', () => {
  let service: VipService;

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
    vipMissionProgress: {
      findUnique: jest.fn(),
      create: jest.fn(),
      upsert: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VipService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<VipService>(VipService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getVipStatus', () => {
    it('should return VIP status for user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: '1',
        vipPoints: 500,
        vipLevelId: 'level1',
        vipLevel: { id: 'level1', name: 'Bronze', level: 1, pointsRequired: 0 },
      });
      mockPrismaService.vipLevel.findFirst.mockResolvedValue({
        id: 'level2',
        name: 'Prata',
        level: 2,
        pointsRequired: 1000,
      });

      const result = await service.getVipStatus('1');
      expect(result.level.name).toBe('Bronze');
      expect(result.points).toBe(500);
    });
  });

  describe('getVipLevels', () => {
    it('should return levels', async () => {
      mockPrismaService.vipLevel.findMany.mockResolvedValue([{ level: 1 }]);
      const result = await service.getVipLevels();
      expect(result).toHaveLength(1);
    });
  });

  describe('getMissions', () => {
    it('should return missions with progress', async () => {
      mockPrismaService.vipMission.findMany.mockResolvedValue([
        {
          id: 'm1',
          code: 'daily-bets-10',
          title: 'Faça 10 apostas',
          description: 'desc',
          type: 'DAILY',
          target: 10,
          rewardPoints: 50,
        },
      ]);
      mockPrismaService.vipMissionProgress.findUnique.mockResolvedValue({
        progress: 3,
        completed: false,
      });

      const result = await service.getMissions('u1');
      expect(result.daily).toHaveLength(1);
      expect(result.daily[0].progress).toBe(3);
    });
  });
});
