import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../database/prisma.service';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let prismaService: PrismaService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'JWT_SECRET') return 'test-secret';
      return null;
    }),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should validate JWT payload', async () => {
      const payload = { sub: 'user1', email: 'test@example.com' };

      const mockUser = {
        id: 'user1',
        email: 'test@example.com',
        isActive: true,
        isBanned: false,
        account: { balance: 1000 },
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await strategy.validate(payload);

      expect(result).toBeDefined();
      expect(result.id).toBe('user1');
      expect(result.email).toBe('test@example.com');
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      const payload = { sub: 'user1', email: 'test@example.com' };

      const mockUser = {
        id: 'user1',
        email: 'test@example.com',
        isActive: false,
        isBanned: false,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(strategy.validate(payload)).rejects.toThrow();
    });

    it('should throw UnauthorizedException for banned user', async () => {
      const payload = { sub: 'user1', email: 'test@example.com' };

      const mockUser = {
        id: 'user1',
        email: 'test@example.com',
        isActive: true,
        isBanned: true,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(strategy.validate(payload)).rejects.toThrow();
    });
  });
});
