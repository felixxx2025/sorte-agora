import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class VipService {
  constructor(private prisma: PrismaService) { }

  async getVipStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    let vipLevel = null;
    if (user.vipLevelId) {
      vipLevel = await this.prisma.vipLevel.findUnique({
        where: { id: user.vipLevelId },
      });
    }

    if (!vipLevel) {
      // Assign default level
      const defaultLevel = await this.prisma.vipLevel.findFirst({
        where: { level: 0 },
      });

      await this.prisma.user.update({
        where: { id: userId },
        data: { vipLevelId: defaultLevel.id },
      });

      return {
        level: defaultLevel,
        points: user.vipPoints,
        nextLevel: null,
        progress: 0,
      };
    }

    const nextLevel = await this.prisma.vipLevel.findFirst({
      where: { level: vipLevel.level + 1 },
    });

    const progress = nextLevel
      ? (user.vipPoints / nextLevel.pointsRequired) * 100
      : 100;

    return {
      level: vipLevel,
      points: user.vipPoints,
      nextLevel,
      progress: Math.min(progress, 100),
    };
  }

  async getVipLevels() {
    return this.prisma.vipLevel.findMany({
      orderBy: { level: 'asc' },
    });
  }

  async getMissions(userId: string) {
    // In production, implement mission logic
    return {
      daily: [
        {
          id: '1',
          title: 'Faça 10 apostas',
          description: 'Complete 10 apostas em qualquer jogo',
          reward: 50,
          progress: 5,
          target: 10,
          completed: false,
        },
        {
          id: '2',
          title: 'Gaste R$ 500 em slots',
          description: 'Gaste R$ 500 jogando slots',
          reward: 100,
          progress: 200,
          target: 500,
          completed: false,
        },
      ],
      weekly: [
        {
          id: '3',
          title: 'Jogue 3 jogos ao vivo',
          description: 'Jogue 3 jogos de cassino ao vivo',
          reward: 75,
          progress: 1,
          target: 3,
          completed: false,
        },
      ],
    };
  }
}
