import { PrismaService } from "../src/database/prisma.service";

export const prismaService = new PrismaService();

beforeAll(async () => {
  // Setup test database connection if needed
});

afterAll(async () => {
  // Cleanup test database connection if needed
});
