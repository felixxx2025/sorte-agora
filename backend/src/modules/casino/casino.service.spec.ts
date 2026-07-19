import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { CasinoService } from './casino.service';

describe('CasinoService', () => {
  let service: CasinoService;

  const mockPrismaService = {
    casinoGame: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    casinoSession: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'CASINO_PROVIDER_MODE') return 'demo';
      if (key === 'FRONTEND_URL') return 'http://localhost:3000';
      return undefined;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CasinoService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<CasinoService>(CasinoService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getGames', () => {
    it('should return games', async () => {
      mockPrismaService.casinoGame.findMany.mockResolvedValue([{ id: '1', name: 'Slots' }]);
      const result = await service.getGames();
      expect(result).toHaveLength(1);
    });
  });

  describe('launchGame', () => {
    it('should launch demo game', async () => {
      mockPrismaService.casinoGame.findUnique.mockResolvedValue({
        id: 'g1',
        providerGameId: 'slots-1',
        name: 'Slots',
        provider: 'DEMO',
        isActive: true,
      });
      mockPrismaService.casinoSession.create.mockResolvedValue({
        id: 's1',
        sessionToken: 'tok',
      });

      const result = await service.launchGame('g1', { userId: 'u1' });
      expect(result.gameUrl).toContain('/casino/play');
      expect(result.mode).toBe('demo');
    });
  });
});
