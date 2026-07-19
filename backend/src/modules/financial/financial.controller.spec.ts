import { Test, TestingModule } from "@nestjs/testing";
import { JwtAuthGuard } from "../../common/guards/auth.guard";
import { FinancialController } from "./financial.controller";
import { FinancialService } from "./financial.service";

describe("FinancialController", () => {
  let controller: FinancialController;
  let financialService: FinancialService;

  const mockFinancialService = {
    getBalance: jest.fn(),
    createDeposit: jest.fn(),
    createWithdraw: jest.fn(),
    getTransactions: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FinancialController],
      providers: [
        {
          provide: FinancialService,
          useValue: mockFinancialService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<FinancialController>(FinancialController);
    financialService = module.get<FinancialService>(FinancialService);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getBalance", () => {
    it("should return user account balance", async () => {
      const mockBalance = {
        balance: 1000,
        bonusBalance: 100,
        lockedBalance: 50,
        currency: "BRL",
      };

      mockFinancialService.getBalance.mockResolvedValue(mockBalance);

      const user = { id: "user1" };
      const result = await controller.getBalance(user);

      expect(result).toBeDefined();
      expect(result.balance).toBe(1000);
      expect(mockFinancialService.getBalance).toHaveBeenCalledWith("user1");
    });
  });

  describe("createDeposit", () => {
    it("should create a deposit", async () => {
      const depositDto = { amount: 500, pixKey: "test-pix" };
      const mockDeposit = {
        transactionId: "tx1",
        pixCode: "pix-code",
        qrCode: "qr-code",
        amount: 500,
        expiresAt: new Date(),
      };

      mockFinancialService.createDeposit.mockResolvedValue(mockDeposit);

      const user = { id: "user1" };
      const result = await controller.createDeposit(user, depositDto);

      expect(result).toHaveProperty("transactionId");
      expect(result.amount).toBe(500);
      expect(mockFinancialService.createDeposit).toHaveBeenCalledWith(
        "user1",
        depositDto,
      );
    });
  });

  describe("createWithdraw", () => {
    it("should create a withdraw", async () => {
      const withdrawDto = { amount: 200, pixKey: "test-pix" };
      const mockWithdraw = {
        transactionId: "tx2",
        amount: 200,
        status: "PENDING",
      };

      mockFinancialService.createWithdraw.mockResolvedValue(mockWithdraw);

      const user = { id: "user1" };
      const result = await controller.createWithdraw(user, withdrawDto);

      expect(result).toHaveProperty("transactionId");
      expect(result.amount).toBe(200);
      expect(mockFinancialService.createWithdraw).toHaveBeenCalledWith(
        "user1",
        withdrawDto,
      );
    });
  });

  describe("getTransactions", () => {
    it("should return user transactions", async () => {
      const mockTransactions = [
        { id: "1", type: "DEPOSIT", amount: 500, status: "COMPLETED" },
        { id: "2", type: "WITHDRAWAL", amount: 200, status: "PENDING" },
      ];

      mockFinancialService.getTransactions.mockResolvedValue(mockTransactions);

      const user = { id: "user1" };
      const result = await controller.getTransactions(user);

      expect(result).toHaveLength(2);
      expect(mockFinancialService.getTransactions).toHaveBeenCalledWith(
        "user1",
      );
    });
  });
});
