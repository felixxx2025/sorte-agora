import { Test } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import * as fs from "fs/promises";
import * as os from "os";
import * as path from "path";
import { StorageService } from "./storage.service";

describe("StorageService", () => {
  it("saves data-url to local disk", async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "sa-store-"));
    const module = await Test.createTestingModule({
      providers: [
        StorageService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              if (key === "STORAGE_DRIVER") return "local";
              if (key === "STORAGE_LOCAL_PATH") return tmp;
              if (key === "STORAGE_PUBLIC_BASE")
                return "http://localhost/uploads";
              return undefined;
            },
          },
        },
      ],
    }).compile();

    const storage = module.get(StorageService);
    const tiny =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
    const saved = await storage.saveDataUrl(tiny, "kyc/test");
    expect(saved.driver).toBe("local");
    expect(saved.url).toContain("http://localhost/uploads/kyc/test/");
    const full = path.join(tmp, saved.key);
    const stat = await fs.stat(full);
    expect(stat.size).toBeGreaterThan(0);
  });
});
