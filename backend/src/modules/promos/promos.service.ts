import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { CreatePromoDto } from "./dto/create-promo.dto";

@Injectable()
export class PromosService {
  constructor(private prisma: PrismaService) {}

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
