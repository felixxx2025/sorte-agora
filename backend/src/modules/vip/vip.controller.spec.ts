import { Test, TestingModule } from '@nestjs/testing';
import { VipController } from './vip.controller';
import { VipService } from './vip.service';
import { JwtAuthGuard } from '../../common/guards/auth.guard';

describe('VipController', () => {
  let controller: VipController;
  let vipService: VipService;

  const mockVipService = {
    getVipStatus: jest.fn(),
    getVipLevels: jest.fn(),
    getMissions: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VipController],
      providers: [
        {
          provide: VipService,
          useValue: mockVipService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<VipController>(VipController);
    vipService = module.get<VipService>(VipService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getVipStatus', () => {
    it('should return VIP status', async () => {
      const mockStatus = {
        level: { name: 'Bronze', level: 1 },
        points: 500,
        progress: 50,
      };

      mockVipService.getVipStatus.mockResolvedValue(mockStatus);

      const user = { id: 'user1' };
      const result = await controller.getVipStatus(user);

      expect(result).toBeDefined();
      expect(result.points).toBe(500);
      expect(mockVipService.getVipStatus).toHaveBeenCalledWith('user1');
    });
  });

  describe('getVipLevels', () => {
    it('should return all VIP levels', async () => {
      const mockLevels = [
        { id: 'level1', name: 'Bronze', level: 1 },
        { id: 'level2', name: 'Silver', level: 2 },
      ];

      mockVipService.getVipLevels.mockResolvedValue(mockLevels);

      const result = await controller.getVipLevels();

      expect(result).toHaveLength(2);
      expect(mockVipService.getVipLevels).toHaveBeenCalled();
    });
  });

  describe('getMissions', () => {
    it('should return VIP missions', async () => {
      const mockMissions = {
        daily: [{ id: '1', title: 'Deposit 100', reward: 50 }],
        weekly: [{ id: '2', title: 'Bet 500', reward: 200 }],
      };

      mockVipService.getMissions.mockResolvedValue(mockMissions);

      const user = { id: 'user1' };
      const result = await controller.getMissions(user);

      expect(result).toBeDefined();
      expect(result.daily).toBeDefined();
      expect(result.weekly).toBeDefined();
      expect(mockVipService.getMissions).toHaveBeenCalledWith('user1');
    });
  });
});
