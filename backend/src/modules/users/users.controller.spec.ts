import { Test, TestingModule } from "@nestjs/testing";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../../common/guards/auth.guard";

describe("UsersController", () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockUsersService = {
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getProfile", () => {
    it("should return user profile", async () => {
      const mockProfile = {
        id: "1",
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
      };

      mockUsersService.getProfile.mockResolvedValue(mockProfile);

      const user = { id: "user1" };
      const result = await controller.getProfile(user);

      expect(result).toBeDefined();
      expect(result.email).toBe("test@example.com");
      expect(mockUsersService.getProfile).toHaveBeenCalledWith("user1");
    });
  });

  describe("updateProfile", () => {
    it("should update user profile", async () => {
      const updateDto = {
        firstName: "Jane",
        lastName: "Smith",
        phone: "+5511999999999",
      };

      const mockUpdatedProfile = {
        id: "1",
        email: "test@example.com",
        firstName: "Jane",
        lastName: "Smith",
        phone: "+5511999999999",
      };

      mockUsersService.updateProfile.mockResolvedValue(mockUpdatedProfile);

      const user = { id: "user1" };
      const result = await controller.updateProfile(user, updateDto);

      expect(result).toBeDefined();
      expect(result.firstName).toBe("Jane");
      expect(mockUsersService.updateProfile).toHaveBeenCalledWith(
        "user1",
        updateDto,
      );
    });
  });
});
