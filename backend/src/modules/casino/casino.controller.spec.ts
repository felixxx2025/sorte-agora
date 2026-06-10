import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../../common/guards/auth.guard';
import { CasinoController } from './casino.controller';
import { CasinoService } from './casino.service';

describe('CasinoController', () => {
  let controller: CasinoController;
  let casinoService: CasinoService;

  const mockCasinoService = {
    getGames: jest.fn(),
    getGame: jest.fn(),
    launchGame: jest.fn(),
    getSessions: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CasinoController],
      providers: [
        {
          provide: CasinoService,
          useValue: mockCasinoService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CasinoController>(CasinoController);
    casinoService = module.get<CasinoService>(CasinoService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getGames', () => {
    it('should return all games', async () => {
      const mockGames = [
        { id: '1', name: 'Slot Machine', category: 'slots' },
        { id: '2', name: 'Blackjack', category: 'table' },
      ];

      mockCasinoService.getGames.mockResolvedValue(mockGames);

      const result = await controller.getGames();

      expect(result).toHaveLength(2);
      expect(mockCasinoService.getGames).toHaveBeenCalled();
    });

    it('should return games filtered by category', async () => {
      const mockGames = [{ id: '1', name: 'Slot Machine', category: 'slots' }];

      mockCasinoService.getGames.mockResolvedValue(mockGames);

      const result = await controller.getGames('slots');

      expect(result).toHaveLength(1);
      expect(mockCasinoService.getGames).toHaveBeenCalledWith('slots');
    });
  });

  describe('getGame', () => {
    it('should return a specific game', async () => {
      const mockGame = { id: '1', name: 'Slot Machine', category: 'slots' };

      mockCasinoService.getGame.mockResolvedValue(mockGame);

      const result = await controller.getGame('1');

      expect(result).toBeDefined();
      expect(result.name).toBe('Slot Machine');
      expect(mockCasinoService.getGame).toHaveBeenCalledWith('1');
    });
  });

  describe('launchGame', () => {
    it('should launch a game', async () => {
      const launchGameDto = { userId: 'user1' };
      const mockResult = {
        sessionId: 'session1',
        gameUrl: 'https://provider.example.com/game/1',
        expiresAt: new Date(),
      };

      mockCasinoService.launchGame.mockResolvedValue(mockResult);

      const result = await controller.launchGame('1', launchGameDto);

      expect(result).toHaveProperty('gameUrl');
      expect(mockCasinoService.launchGame).toHaveBeenCalledWith('1', launchGameDto);
    });
  });

  describe('getSessions', () => {
    it('should return user sessions', async () => {
      const mockSessions = [
        { id: 'session1', userId: 'user1', gameId: '1' },
        { id: 'session2', userId: 'user1', gameId: '2' },
      ];

      mockCasinoService.getSessions.mockResolvedValue(mockSessions);

      const result = await controller.getSessions('user1');

      expect(result).toHaveLength(2);
      expect(mockCasinoService.getSessions).toHaveBeenCalledWith('user1');
    });
  });
});
