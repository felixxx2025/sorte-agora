import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { FeatureFlagsService } from "./feature-flags.service";

describe("FeatureFlagsService", () => {
  let service: FeatureFlagsService;
  let values: Record<string, string | undefined>;

  beforeEach(async () => {
    values = {};
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeatureFlagsService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => values[key],
          },
        },
      ],
    }).compile();
    service = module.get(FeatureFlagsService);
  });

  it("defaults modules on", () => {
    expect(service.casino).toBe(true);
    expect(service.sports).toBe(true);
    expect(service.lgpd).toBe(true);
    expect(service.crash).toBe(true);
    expect(service.chat).toBe(true);
  });

  it("respects false flags", () => {
    values.ENABLE_CASINO = "false";
    values.ENABLE_SPORTS = "0";
    values.ENABLE_CRASH = "false";
    values.ENABLE_CHAT = "0";
    expect(service.casino).toBe(false);
    expect(service.sports).toBe(false);
    expect(service.crash).toBe(false);
    expect(service.chat).toBe(false);
  });

  it("snapshot includes modes", () => {
    values.PIX_AUTO_CONFIRM = "true";
    values.CASINO_PROVIDER_MODE = "live";
    const snap = service.snapshot();
    expect(snap.pixAutoConfirm).toBe(true);
    expect(snap.casinoMode).toBe("live");
    expect(snap.crash).toBe(true);
    expect(snap.chat).toBe(true);
  });
});
