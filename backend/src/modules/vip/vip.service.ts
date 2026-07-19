import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";

@Injectable()
export class VipService {
  constructor(private prisma: PrismaService) {}

  async getVipStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { vipLevel: true },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    let vipLevel = user.vipLevel;
    if (!vipLevel) {
      vipLevel = await this.prisma.vipLevel.findFirst({
        where: { level: 1 },
        orderBy: { level: "asc" },
      });

      if (vipLevel) {
        await this.prisma.user.update({
          where: { id: userId },
          data: { vipLevelId: vipLevel.id },
        });
      }
    }

    const nextLevel = vipLevel
      ? await this.prisma.vipLevel.findFirst({
          where: { level: vipLevel.level + 1 },
        })
      : null;

    const progress = nextLevel
      ? Math.min((user.vipPoints / nextLevel.pointsRequired) * 100, 100)
      : 100;

    return {
      level: vipLevel,
      points: user.vipPoints,
      nextLevel,
      progress,
    };
  }

  async getVipLevels() {
    return this.prisma.vipLevel.findMany({
      orderBy: { level: "asc" },
    });
  }

  async getMissions(userId: string) {
    const missions = await this.prisma.vipMission.findMany({
      where: { isActive: true },
      orderBy: { type: "asc" },
    });

    const dailyKey = this.dailyPeriodKey();
    const weeklyKey = this.weeklyPeriodKey();

    const result = { daily: [], weekly: [] } as {
      daily: any[];
      weekly: any[];
    };

    for (const mission of missions) {
      const periodKey = mission.type === "WEEKLY" ? weeklyKey : dailyKey;
      let progress = await this.prisma.vipMissionProgress.findUnique({
        where: {
          userId_missionId_periodKey: {
            userId,
            missionId: mission.id,
            periodKey,
          },
        },
      });

      if (!progress) {
        progress = await this.prisma.vipMissionProgress.create({
          data: {
            userId,
            missionId: mission.id,
            periodKey,
            progress: 0,
          },
        });
      }

      const item = {
        id: mission.id,
        code: mission.code,
        title: mission.title,
        description: mission.description,
        type: mission.type,
        reward: mission.rewardPoints,
        progress: progress.progress,
        target: mission.target,
        completed: progress.completed,
      };

      if (mission.type === "WEEKLY") {
        result.weekly.push(item);
      } else {
        result.daily.push(item);
      }
    }

    return result;
  }

  async addProgress(userId: string, metric: string, amount = 1) {
    const missions = await this.prisma.vipMission.findMany({
      where: { isActive: true, metric },
    });

    for (const mission of missions) {
      const periodKey =
        mission.type === "WEEKLY"
          ? this.weeklyPeriodKey()
          : this.dailyPeriodKey();

      const progress = await this.prisma.vipMissionProgress.upsert({
        where: {
          userId_missionId_periodKey: {
            userId,
            missionId: mission.id,
            periodKey,
          },
        },
        create: {
          userId,
          missionId: mission.id,
          periodKey,
          progress: amount,
        },
        update: {
          progress: { increment: amount },
        },
      });

      if (
        !progress.completed &&
        progress.progress + (progress.progress === amount ? 0 : 0) >=
          mission.target
      ) {
        const updated = await this.prisma.vipMissionProgress.findUnique({
          where: { id: progress.id },
        });
        if (
          updated &&
          !updated.completed &&
          updated.progress >= mission.target
        ) {
          await this.prisma.$transaction([
            this.prisma.vipMissionProgress.update({
              where: { id: updated.id },
              data: {
                completed: true,
                completedAt: new Date(),
                progress: mission.target,
              },
            }),
            this.prisma.user.update({
              where: { id: userId },
              data: { vipPoints: { increment: mission.rewardPoints } },
            }),
          ]);
          await this.recalculateVipLevel(userId);
        }
      }
    }
  }

  async recalculateVipLevel(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const level = await this.prisma.vipLevel.findFirst({
      where: { pointsRequired: { lte: user.vipPoints } },
      orderBy: { level: "desc" },
    });

    if (level && level.id !== user.vipLevelId) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { vipLevelId: level.id },
      });
    }
  }

  private dailyPeriodKey() {
    return new Date().toISOString().slice(0, 10);
  }

  private weeklyPeriodKey() {
    const d = new Date();
    const oneJan = new Date(d.getFullYear(), 0, 1);
    const week = Math.ceil(
      ((d.getTime() - oneJan.getTime()) / 86400000 + oneJan.getDay() + 1) / 7,
    );
    return `${d.getFullYear()}-W${week}`;
  }
}
