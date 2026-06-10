import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../database/prisma.service';
import { CasinoService } from './casino.service';

describe('CasinoService', () => {
  let service: CasinoService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    casinoGame: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    casinoSession: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CasinoService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CasinoService>(CasinoService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getGames', () => {
    it('should return all games', async () => {
      const mockGames = [
        { id: '1', name: 'Slot Machine', category: 'slots', provider: 'Provider1', rtp: 95 },
        { id: '2', name: 'Blackjack', category: 'table', provider: 'Provider2', rtp: 99 },
      ];

      mockPrismaService.casinoGame.findMany.mockResolvedValue(mockGames);

      const result = await service.getGames();

      expect(result).toHaveLength(2);
      expect(mockPrismaService.casinoGame.findMany).toHaveBeenCalled();
    });

    it('should return games filtered by category', async () => {
      const mockGames = [
        { id: '1', name: 'Slot Machine', category: 'slots', provider: 'Provider1', rtp: 95 },
      ];

      mockPrismaService.casinoGame.findMany.mockResolvedValue(mockGames);

      const result = await service.getGames('slots');

      expect(result).toHaveLength(1);
      expect(result[0].category).toBe('slots');
    });
  });

  describe('getGame', () => {
    it('should return a specific game', async () => {
      const mockGame = {
        id: '1',
        name: 'Slot Machine',
        category: 'slots',
        provider: 'Provider1',
        rtp: 95,
      };

      mockPrismaService.casinoGame.findUnique.mockResolvedValue(mockGame);

      const result = await service.getGame('1');

      expect(result).toBeDefined();
      expect(result.name).toBe('Slot Machine');
      expect(mockPrismaService.casinoGame.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });

  describe('launchGame', () => {
    it('should create a game session', async () => {
      const mockSession = {
        id: 'session1',
        userId: 'user1',
        gameId: '1',
        sessionToken: 'token123',
      };

      const launchGameDto = { userId: 'user1' };

      mockPrismaService.casinoGame.findUnique.mockResolvedValue({ id: '1', name: 'Slot Machine', providerGameId: 'game1' });
      mockPrismaService.casinoSession.create.mockResolvedValue(mockSession);

      const result = await service.launchGame('1', launchGameDto);

      expect(result).toHaveProperty('gameUrl');
      expect(mockPrismaService.casinoSession.create).toHaveBeenCalled();
    });
  });
});
