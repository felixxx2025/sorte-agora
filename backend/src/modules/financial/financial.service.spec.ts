import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { FinancialService } from './financial.service';

describe('FinancialService', () => {
  let service: FinancialService;

  const mockPrismaService = {
    account: {
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    transaction: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'PIX_AUTO_CONFIRM') return 'true';
      if (key === 'NODE_ENV') return 'test';
      return undefined;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinancialService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<FinancialService>(FinancialService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getBalance', () => {
    it('should return user balance', async () => {
      const mockAccount = {
        id: '1',
        userId: 'user1',
        balance: 1000,
        currency: 'BRL',
        bonusBalance: 100,
        lockedBalance: 50,
      };

      mockPrismaService.account.findUnique.mockResolvedValue(mockAccount);

      const result = await service.getBalance('user1');

      expect(result).toBeDefined();
      expect(result.balance).toBe(1000);
      expect(result.bonusBalance).toBe(100);
      expect(result.lockedBalance).toBe(50);
      expect(mockPrismaService.account.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user1' },
      });
    });

    it('should throw NotFoundException when account missing', async () => {
      mockPrismaService.account.findUnique.mockResolvedValue(null);
      await expect(service.getBalance('user1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createDeposit', () => {
    it('should create a deposit and credit balance when auto-confirm is on', async () => {
      const mockAccount = {
        id: '1',
        userId: 'user1',
        balance: 1000,
        currency: 'BRL',
      };

      mockPrismaService.account.findUnique.mockResolvedValue(mockAccount);
      mockPrismaService.$transaction.mockImplementation(async (cb) =>
        cb({
          transaction: {
            create: jest.fn().mockResolvedValue({ id: 'tx1' }),
          },
          account: {
            update: jest.fn().mockResolvedValue({ ...mockAccount, balance: 1500 }),
          },
        }),
      );

      const result = await service.createDeposit('user1', { amount: 500 });

      expect(result).toHaveProperty('pixCode');
      expect(result).toHaveProperty('qrCode');
      expect(result.status).toBe('COMPLETED');
      expect(result.autoConfirmed).toBe(true);
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });
  });

  describe('createWithdraw', () => {
    it('should create a withdraw transaction with sufficient balance', async () => {
      const mockAccount = {
        id: '1',
        userId: 'user1',
        balance: 1000,
        currency: 'BRL',
      };

      mockPrismaService.account.findUnique.mockResolvedValue(mockAccount);
      mockPrismaService.$transaction.mockImplementation(async (cb) =>
        cb({
          transaction: {
            create: jest.fn().mockResolvedValue({ id: 'tx-w1' }),
          },
          account: {
            update: jest.fn().mockResolvedValue(mockAccount),
          },
        }),
      );

      const result = await service.createWithdraw('user1', {
        amount: 500,
        pixKey: 'test-pix-key',
      });

      expect(result).toHaveProperty('transactionId');
      expect(result.status).toBe('PENDING');
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });

    it('should throw error with insufficient balance', async () => {
      const mockAccount = {
        id: '1',
        userId: 'user1',
        balance: 100,
        currency: 'BRL',
      };

      mockPrismaService.account.findUnique.mockResolvedValue(mockAccount);

      await expect(
        service.createWithdraw('user1', { amount: 500, pixKey: 'test-pix-key' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getTransactions', () => {
    it('should return user transactions', async () => {
      const mockTransactions = [
        { id: '1', type: 'DEPOSIT', amount: 500, status: 'COMPLETED' },
        { id: '2', type: 'WITHDRAWAL', amount: 200, status: 'COMPLETED' },
      ];

      mockPrismaService.transaction.findMany.mockResolvedValue(mockTransactions);

      const result = await service.getTransactions('user1');

      expect(result).toHaveLength(2);
      expect(mockPrismaService.transaction.findMany).toHaveBeenCalledWith({
        where: { userId: 'user1' },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    });
  });
});
