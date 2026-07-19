import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../../database/prisma.service';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+5511999999999',
        country: 'BR',
        currency: 'BRL',
        isVerified: true,
        isKycVerified: false,
        vipPoints: 100,
        account: {
          balance: 1000,
          currency: 'BRL',
        },
        createdAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getProfile('user1');

      expect(result).toBeDefined();
      expect(result.email).toBe('test@example.com');
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user1' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          country: true,
          currency: true,
          role: true,
          isVerified: true,
          isKycVerified: true,
          mfaEnabled: true,
          vipPoints: true,
          vipLevelId: true,
          account: true,
          createdAt: true,
        },
      });
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '+5511999999999',
      };

      mockPrismaService.user.update.mockResolvedValue(mockUser);

      const result = await service.updateProfile('user1', {
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '+5511999999999',
      });

      expect(result).toBeDefined();
      expect(result.firstName).toBe('Jane');
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user1' },
        data: {
          firstName: 'Jane',
          lastName: 'Smith',
          phone: '+5511999999999',
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          country: true,
        },
      });
    });
  });
});
