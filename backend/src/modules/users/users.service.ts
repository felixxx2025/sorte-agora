import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { MailService } from "../../common/services/mail.service";
import { StorageService } from "../../common/services/storage.service";
import { PrismaService } from "../../database/prisma.service";
import { ResponsibleGamingDto } from "./dto/responsible-gaming.dto";
import { SubmitKycDto } from "./dto/submit-kyc.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
    private mail: MailService,
  ) {}

  async getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
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
        selfExcludedUntil: true,
        depositLimitDaily: true,
        depositLimitWeekly: true,
        depositLimitMonthly: true,
        lossLimitDaily: true,
        lossLimitWeekly: true,
        lossLimitMonthly: true,
        sessionTimeLimitMinutes: true,
        account: true,
        createdAt: true,
      },
    });
  }

  async updateResponsibleGaming(userId: string, dto: ResponsibleGamingDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.depositLimitDaily !== undefined && {
          depositLimitDaily: dto.depositLimitDaily,
        }),
        ...(dto.depositLimitWeekly !== undefined && {
          depositLimitWeekly: dto.depositLimitWeekly,
        }),
        ...(dto.depositLimitMonthly !== undefined && {
          depositLimitMonthly: dto.depositLimitMonthly,
        }),
        ...(dto.lossLimitDaily !== undefined && {
          lossLimitDaily: dto.lossLimitDaily,
        }),
        ...(dto.lossLimitWeekly !== undefined && {
          lossLimitWeekly: dto.lossLimitWeekly,
        }),
        ...(dto.lossLimitMonthly !== undefined && {
          lossLimitMonthly: dto.lossLimitMonthly,
        }),
        ...(dto.sessionTimeLimitMinutes !== undefined && {
          sessionTimeLimitMinutes: dto.sessionTimeLimitMinutes,
        }),
      },
      select: {
        depositLimitDaily: true,
        depositLimitWeekly: true,
        depositLimitMonthly: true,
        lossLimitDaily: true,
        lossLimitWeekly: true,
        lossLimitMonthly: true,
        sessionTimeLimitMinutes: true,
      },
    });
  }

  async listFavorites(userId: string) {
    return this.prisma.favoriteGame.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { game: true },
    });
  }

  async toggleFavorite(userId: string, gameId: string) {
    const game = await this.prisma.casinoGame.findUnique({
      where: { id: gameId },
    });
    if (!game) {
      throw new NotFoundException("Game not found");
    }

    const existing = await this.prisma.favoriteGame.findUnique({
      where: { userId_gameId: { userId, gameId } },
    });

    if (existing) {
      await this.prisma.favoriteGame.delete({ where: { id: existing.id } });
      return { favorited: false };
    }

    await this.prisma.favoriteGame.create({
      data: { userId, gameId },
    });
    return { favorited: true };
  }

  async updateProfile(userId: string, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        country: true,
      },
    });
  }

  async submitKyc(userId: string, dto: SubmitKycDto) {
    const pending = await this.prisma.kyCRecord.findFirst({
      where: { userId, status: "PENDING" },
    });

    if (pending) {
      throw new BadRequestException(
        "You already have a pending KYC submission",
      );
    }

    const front = await this.storage.saveDataUrl(
      dto.documentFront,
      `kyc/${userId}`,
    );
    const selfie = await this.storage.saveDataUrl(dto.selfie, `kyc/${userId}`);

    return this.prisma.kyCRecord.create({
      data: {
        userId,
        documentType: dto.documentType,
        documentNumber: dto.documentNumber,
        documentFront: front.url,
        selfie: selfie.url,
        status: "PENDING",
      },
    });
  }

  async getKycStatus(userId: string) {
    const latest = await this.prisma.kyCRecord.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isKycVerified: true },
    });

    return {
      isKycVerified: user?.isKycVerified || false,
      latest,
    };
  }

  async exportMyData(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        account: true,
        kycRecords: true,
        transactions: { take: 500, orderBy: { createdAt: "desc" } },
        sportsBets: { take: 200, orderBy: { createdAt: "desc" } },
        casinoSessions: { take: 100, orderBy: { startedAt: "desc" } },
      },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException("User not found");
    }

    const { password, mfaSecret, resetToken, ...safe } = user as any;
    return {
      exportedAt: new Date().toISOString(),
      data: safe,
    };
  }

  async deleteMyAccount(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.deletedAt) {
      throw new NotFoundException("User not found");
    }

    const anonymized = `deleted_${userId.slice(0, 8)}@deleted.local`;
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        email: anonymized,
        username: null,
        phone: null,
        firstName: "Deleted",
        lastName: "User",
        password: null,
        mfaSecret: null,
        mfaEnabled: false,
        isActive: false,
        deletedAt: new Date(),
        resetToken: null,
        resetTokenExpiry: null,
        emailVerificationToken: null,
        emailVerificationExpiry: null,
      },
    });

    try {
      await this.mail.sendMail({
        to: user.email,
        subject: "Conta excluída — SORTE AGORA",
        html: "<p>Sua conta foi anonimizada conforme solicitação LGPD.</p>",
      });
    } catch {
      // ignore mail errors
    }

    return { message: "Account deleted and anonymized", deletedAt: new Date() };
  }

  async selfExclude(userId: string, days: number) {
    if (!days || days < 1 || days > 3650) {
      throw new BadRequestException("days must be between 1 and 3650");
    }
    const until = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    await this.prisma.user.update({
      where: { id: userId },
      data: { selfExcludedUntil: until },
    });
    return { selfExcludedUntil: until, days };
  }
}
