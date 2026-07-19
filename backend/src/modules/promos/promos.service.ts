import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CacheService } from "../../common/services/cache.service";
import { PrismaService } from "../../database/prisma.service";
import { CreatePromoDto } from "./dto/create-promo.dto";

@Injectable()
export class PromosService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  async listActive() {
    const now = new Date();
    return this.prisma.promoBanner.findMany({
      where: {
        isActive: true,
        validFrom: { lte: now },
        OR: [{ validTo: null }, { validTo: { gte: now } }],
      },
      orderBy: { sortOrder: "asc" },
    });
  }

  async getActiveByIdOrSlug(idOrSlug: string) {
    const now = new Date();
    const found = await this.prisma.promoBanner.findFirst({
      where: {
        AND: [
          { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
          { isActive: true },
          { validFrom: { lte: now } },
          { OR: [{ validTo: null }, { validTo: { gte: now } }] },
        ],
      },
    });

    if (!found) throw new NotFoundException("Promo not found");
    return found;
  }

  async claim(userId: string, idOrSlug: string) {
    const promo = await this.getActiveByIdOrSlug(idOrSlug);
    const claimKey = `promo:claim:${userId}:${promo.id}`;

    const alreadyClaimed = await this.cache.getJson<{ claimed: boolean }>(
      claimKey,
    );
    if (alreadyClaimed?.claimed) {
      throw new BadRequestException("Promo already claimed");
    }

    const recentClaim = await this.prisma.transaction.findFirst({
      where: {
        userId,
        type: "BONUS_CLAIM",
        providerRef: promo.id,
      },
    });
    if (recentClaim) {
      throw new BadRequestException("Promo already claimed");
    }

    const account = await this.prisma.account.findUnique({
      where: { userId },
    });
    if (!account) {
      throw new NotFoundException("Account not found");
    }

    const bonusAmount = Number(promo.maxBonus ?? 10);

    const result = await this.prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          userId,
          accountId: account.id,
          type: "BONUS_CLAIM",
          amount: bonusAmount,
          providerRef: promo.id,
          status: "COMPLETED",
          processedAt: new Date(),
        },
      });

      const updatedAccount = await tx.account.update({
        where: { id: account.id },
        data: {
          bonusBalance: { increment: bonusAmount },
        },
      });

      return { transaction, updatedAccount };
    });

    await this.cache.setJson(claimKey, { claimed: true }, 60 * 60 * 24 * 365);

    return {
      promoId: promo.id,
      amount: bonusAmount,
      bonusBalance: result.updatedAccount.bonusBalance,
      transactionId: result.transaction.id,
      message: "Promo claimed successfully",
    };
  }

  async listAll() {
    return this.prisma.promoBanner.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
  }

  async create(dto: CreatePromoDto) {
    return this.prisma.promoBanner.create({
      data: {
        title: dto.title,
        subtitle: dto.subtitle,
        imageUrl: dto.imageUrl,
        href: dto.href,
        slug: dto.slug,
        terms: dto.terms,
        bonusPercentage: dto.bonusPercentage,
        freeSpins: dto.freeSpins,
        wageringRequirement: dto.wageringRequirement,
        minDeposit: dto.minDeposit,
        maxBonus: dto.maxBonus,
        promoCode: dto.promoCode,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
        validFrom: dto.validFrom ? new Date(dto.validFrom) : undefined,
        validTo: dto.validTo ? new Date(dto.validTo) : null,
      },
    });
  }

  async update(id: string, dto: Partial<CreatePromoDto>) {
    const existing = await this.prisma.promoBanner.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Promo not found");

    return this.prisma.promoBanner.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.subtitle !== undefined && { subtitle: dto.subtitle }),
        ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
        ...(dto.href !== undefined && { href: dto.href }),
        ...(dto.slug !== undefined && { slug: dto.slug }),
        ...(dto.terms !== undefined && { terms: dto.terms }),
        ...(dto.bonusPercentage !== undefined && {
          bonusPercentage: dto.bonusPercentage,
        }),
        ...(dto.freeSpins !== undefined && { freeSpins: dto.freeSpins }),
        ...(dto.wageringRequirement !== undefined && {
          wageringRequirement: dto.wageringRequirement,
        }),
        ...(dto.minDeposit !== undefined && { minDeposit: dto.minDeposit }),
        ...(dto.maxBonus !== undefined && { maxBonus: dto.maxBonus }),
        ...(dto.promoCode !== undefined && { promoCode: dto.promoCode }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.validFrom !== undefined && {
          validFrom: new Date(dto.validFrom),
        }),
        ...(dto.validTo !== undefined && {
          validTo: dto.validTo ? new Date(dto.validTo) : null,
        }),
      },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.promoBanner.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Promo not found");
    await this.prisma.promoBanner.delete({ where: { id } });
    return { message: "Promo deleted" };
  }
}
