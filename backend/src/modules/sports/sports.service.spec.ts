import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../database/prisma.service';
import { SportsService } from './sports.service';

describe('SportsService', () => {
  let service: SportsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    sportsEvent: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    sportsBet: {
      create: jest.fn(),
      findMany: jest.fn(),
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
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SportsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SportsService>(SportsService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getEvents', () => {
    it('should return all events', async () => {
      const mockEvents = [
        { id: '1', sport: 'Football', homeTeam: 'Team A', awayTeam: 'Team B', isLive: true },
        { id: '2', sport: 'Basketball', homeTeam: 'Team C', awayTeam: 'Team D', isLive: false },
      ];

      mockPrismaService.sportsEvent.findMany.mockResolvedValue(mockEvents);

      const result = await service.getEvents();

      expect(result).toHaveLength(2);
      expect(mockPrismaService.sportsEvent.findMany).toHaveBeenCalled();
    });

    it('should return live events only', async () => {
      const mockEvents = [
        { id: '1', sport: 'Football', homeTeam: 'Team A', awayTeam: 'Team B', isLive: true },
      ];

      mockPrismaService.sportsEvent.findMany.mockResolvedValue(mockEvents);

      const result = await service.getEvents(true);

      expect(result).toHaveLength(1);
      expect(result[0].isLive).toBe(true);
    });
  });

  describe('getEvent', () => {
    it('should return a specific event', async () => {
      const mockEvent = {
        id: '1',
        name: 'Football Match',
        startTime: new Date(),
        isLive: true,
        status: 'LIVE',
        markets: [
          {
            id: 'm1',
            name: 'Match Winner',
            selections: [
              { id: 's1', name: 'Team A', odds: 2.5 },
              { id: 's2', name: 'Draw', odds: 3.0 },
              { id: 's3', name: 'Team B', odds: 2.8 },
            ],
          },
        ],
      };

      mockPrismaService.sportsEvent.findUnique.mockResolvedValue(mockEvent);

      const result = await service.getEvent('1');

      expect(result).toBeDefined();
      expect(result.name).toBe('Football Match');
      expect(mockPrismaService.sportsEvent.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          markets: {
            include: {
              selections: true,
            },
          },
        },
      });
    });
  });

  describe('placeBet', () => {
    it('should create a bet', async () => {
      const placeBetDto = {
        selectionId: 's1',
        stake: 100,
        userId: 'user1',
      };

      const mockSelection = {
        id: 's1',
        name: 'Team A',
        odds: 2.5,
        market: {
          id: 'm1',
          eventId: 'event1',
        },
      };

      const mockAccount = {
        id: 'acc1',
        userId: 'user1',
        balance: 1000,
      };

      const mockBet = {
        id: 'bet1',
        userId: 'user1',
        selectionId: 's1',
        stake: 100,
        odds: 2.5,
        status: 'PENDING',
      };

      mockPrismaService.sportsSelection.findUnique.mockResolvedValue(mockSelection);
      mockPrismaService.account.findUnique.mockResolvedValue(mockAccount);
      mockPrismaService.sportsBet.create.mockResolvedValue(mockBet);
      mockPrismaService.account.update.mockResolvedValue(mockAccount);
      mockPrismaService.transaction.create.mockResolvedValue({});

      const result = await service.placeBet(placeBetDto);

      expect(result).toBeDefined();
      expect(result.betId).toBe('bet1');
      expect(result.potentialWin).toBe(250);
      expect(mockPrismaService.sportsBet.create).toHaveBeenCalled();
    });
  });

  describe('getBets', () => {
    it('should return user bets', async () => {
      const mockBets = [
        { id: 'bet1', userId: 'user1', stake: 100, status: 'PENDING' },
        { id: 'bet2', userId: 'user1', stake: 200, status: 'WON' },
      ];

      mockPrismaService.sportsBet.findMany.mockResolvedValue(mockBets);

      const result = await service.getBets('user1');

      expect(result).toHaveLength(2);
      expect(mockPrismaService.sportsBet.findMany).toHaveBeenCalledWith({
        where: { userId: 'user1' },
        include: {
          event: true,
          selection: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    });
  });
});
