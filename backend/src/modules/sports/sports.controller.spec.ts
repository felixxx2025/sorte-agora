import { Test, TestingModule } from "@nestjs/testing";
import { JwtAuthGuard } from "../../common/guards/auth.guard";
import { FeatureFlagsService } from "../../common/services/feature-flags.service";
import { SportsController } from "./sports.controller";
import { SportsService } from "./sports.service";

describe("SportsController", () => {
  let controller: SportsController;

  const mockSportsService = {
    getEvents: jest.fn(),
    getEvent: jest.fn(),
    placeBet: jest.fn(),
    getBets: jest.fn(),
  };

  const mockFlags = { sports: true };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SportsController],
      providers: [
        {
          provide: SportsService,
          useValue: mockSportsService,
        },
        {
          provide: FeatureFlagsService,
          useValue: mockFlags,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<SportsController>(SportsController);
    jest.clearAllMocks();
    mockFlags.sports = true;
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getEvents", () => {
    it("should return all events", async () => {
      const mockEvents = [
        { id: "1", name: "Football Match", isLive: true },
        { id: "2", name: "Basketball Match", isLive: false },
      ];

      mockSportsService.getEvents.mockResolvedValue(mockEvents);

      const result = await controller.getEvents();

      expect(result).toHaveLength(2);
      expect(mockSportsService.getEvents).toHaveBeenCalled();
    });

    it("should return live events only", async () => {
      const mockEvents = [{ id: "1", name: "Football Match", isLive: true }];

      mockSportsService.getEvents.mockResolvedValue(mockEvents);

      const result = await controller.getEvents("true");

      expect(result).toHaveLength(1);
      expect(mockSportsService.getEvents).toHaveBeenCalledWith(true);
    });
  });

  describe("getEvent", () => {
    it("should return a specific event", async () => {
      const mockEvent = { id: "1", name: "Football Match", isLive: true };

      mockSportsService.getEvent.mockResolvedValue(mockEvent);

      const result = await controller.getEvent("1");

      expect(result).toBeDefined();
      expect(result.name).toBe("Football Match");
      expect(mockSportsService.getEvent).toHaveBeenCalledWith("1");
    });
  });

  describe("placeBet", () => {
    it("should place a bet", async () => {
      const placeBetDto = { selectionId: "s1", stake: 100 };
      const user = { id: "user1" };
      const mockResult = {
        betId: "bet1",
        potentialWin: 250,
        status: "PENDING",
      };

      mockSportsService.placeBet.mockResolvedValue(mockResult);

      const result = await controller.placeBet(user, placeBetDto as any);

      expect(result).toHaveProperty("betId");
      expect(mockSportsService.placeBet).toHaveBeenCalledWith(
        "user1",
        placeBetDto,
      );
    });
  });

  describe("getBets", () => {
    it("should return user bets", async () => {
      const mockBets = [
        { id: "bet1", userId: "user1", stake: 100, status: "PENDING" },
        { id: "bet2", userId: "user1", stake: 200, status: "WON" },
      ];

      mockSportsService.getBets.mockResolvedValue(mockBets);

      const result = await controller.getBets({ id: "user1" });

      expect(result).toHaveLength(2);
      expect(mockSportsService.getBets).toHaveBeenCalledWith("user1");
    });
  });

  describe("feature flag", () => {
    it("throws when sports disabled", () => {
      mockFlags.sports = false;
      expect(() => controller.getEvents()).toThrow(/Sports is disabled/);
    });
  });
});
