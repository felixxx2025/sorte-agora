import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding SORTE AGORA database...');

  const vipLevels = [
    { name: 'Bronze', level: 1, pointsRequired: 0, cashbackPercent: 0.5 },
    { name: 'Prata', level: 2, pointsRequired: 1000, cashbackPercent: 1 },
    { name: 'Ouro', level: 3, pointsRequired: 5000, cashbackPercent: 2 },
    { name: 'Platina', level: 4, pointsRequired: 15000, cashbackPercent: 3 },
    { name: 'Diamante', level: 5, pointsRequired: 50000, cashbackPercent: 5 },
  ];

  for (const level of vipLevels) {
    await prisma.vipLevel.upsert({
      where: { level: level.level },
      update: level,
      create: level,
    });
  }

  const missions = [
    {
      code: 'daily-bets-10',
      title: 'Faça 10 apostas',
      description: 'Complete 10 apostas em esportes',
      type: 'DAILY',
      metric: 'BETS_COUNT',
      target: 10,
      rewardPoints: 50,
    },
    {
      code: 'daily-bet-amount',
      title: 'Aposte R$ 100',
      description: 'Some R$ 100 em apostas no dia',
      type: 'DAILY',
      metric: 'BET_AMOUNT',
      target: 100,
      rewardPoints: 80,
    },
    {
      code: 'weekly-casino-3',
      title: 'Jogue 3 sessões de cassino',
      description: 'Abra 3 jogos de cassino na semana',
      type: 'WEEKLY',
      metric: 'CASINO_SESSIONS',
      target: 3,
      rewardPoints: 75,
    },
  ];

  for (const mission of missions) {
    await prisma.vipMission.upsert({
      where: { code: mission.code },
      update: mission,
      create: mission,
    });
  }

  const games = [
    {
      provider: 'DEMO',
      providerGameId: 'slots-fortune',
      name: 'Fortune Slots',
      category: 'slots',
      thumbnail: '/games/fortune-slots.png',
      rtp: 96.5,
      minBet: 0.5,
      maxBet: 500,
    },
    {
      provider: 'DEMO',
      providerGameId: 'roulette-classic',
      name: 'Roleta Clássica',
      category: 'table',
      thumbnail: '/games/roulette.png',
      rtp: 97.3,
      minBet: 1,
      maxBet: 1000,
    },
    {
      provider: 'DEMO',
      providerGameId: 'blackjack-pro',
      name: 'Blackjack Pro',
      category: 'table',
      thumbnail: '/games/blackjack.png',
      rtp: 99.5,
      minBet: 5,
      maxBet: 2000,
    },
    {
      provider: 'DEMO',
      providerGameId: 'crash-x',
      name: 'Crash X',
      category: 'crash',
      thumbnail: '/games/crash.png',
      rtp: 97.0,
      minBet: 1,
      maxBet: 500,
    },
  ];

  for (const game of games) {
    await prisma.casinoGame.upsert({
      where: {
        provider_providerGameId: {
          provider: game.provider,
          providerGameId: game.providerGameId,
        },
      },
      update: game,
      create: game,
    });
  }

  const liveCasino = await prisma.casinoGame.findFirst({
    where: { category: "live" },
  });
  if (!liveCasino) {
    await prisma.casinoGame.create({
      data: {
        provider: "DEMO",
        providerGameId: "live-roulette-eu",
        name: "Roleta ao Vivo",
        category: "live",
        thumbnail: "/games/live-roulette.png",
        rtp: 97.3,
        minBet: 1,
        maxBet: 5000,
      },
    });
  }

  const banners = [
    {
      title: "Bônus de Boas-Vindas",
      subtitle: "100% até R$ 500 no primeiro depósito",
      imageUrl: "/promos/welcome.png",
      href: "/promocoes/boas-vindas",
      sortOrder: 1,
    },
    {
      title: "Crash X",
      subtitle: "Multiplique antes do crash — demo ao vivo",
      imageUrl: "/promos/crash.png",
      href: "/crash",
      sortOrder: 2,
    },
    {
      title: "Esporte ao Vivo",
      subtitle: "Aposte enquanto o jogo acontece",
      imageUrl: "/promos/live-sports.png",
      href: "/esportes?live=1",
      sortOrder: 3,
    },
  ];

  for (const banner of banners) {
    const existing = await prisma.promoBanner.findFirst({
      where: { title: banner.title },
    });
    if (!existing) {
      await prisma.promoBanner.create({ data: banner });
    } else {
      await prisma.promoBanner.update({
        where: { id: existing.id },
        data: { ...banner, isActive: true },
      });
    }
  }

  const startTime = new Date(Date.now() + 2 * 60 * 60 * 1000);
  const existingEvent = await prisma.sportsEvent.findFirst({
    where: { name: "Flamengo vs Palmeiras" },
  });

  if (!existingEvent) {
    await prisma.sportsEvent.create({
      data: {
        name: "Flamengo vs Palmeiras",
        startTime,
        isLive: false,
        status: "SCHEDULED",
        markets: {
          create: [
            {
              name: "Resultado Final",
              selections: {
                create: [
                  { name: "Flamengo", odds: 2.1 },
                  { name: "Empate", odds: 3.2 },
                  { name: "Palmeiras", odds: 3.4 },
                ],
              },
            },
          ],
        },
      },
    });
  }

  const liveEvent = await prisma.sportsEvent.findFirst({
    where: { isLive: true },
  });
  if (!liveEvent) {
    await prisma.sportsEvent.create({
      data: {
        name: "Brasil vs Argentina (AO VIVO)",
        startTime: new Date(),
        isLive: true,
        status: "LIVE",
        markets: {
          create: [
            {
              name: "Resultado Final",
              selections: {
                create: [
                  { name: "Brasil", odds: 2.4 },
                  { name: "Empate", odds: 3.1 },
                  { name: "Argentina", odds: 2.9 },
                ],
              },
            },
          ],
        },
      },
    });
  }

  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sorteagora.com' },
    update: {},
    create: {
      email: 'admin@sorteagora.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'SORTE',
      role: 'ADMIN',
      isVerified: true,
      referralCode: 'ADMIN001',
      account: {
        create: {
          currency: 'BRL',
          balance: 0,
        },
      },
    },
  });

  const userPassword = await bcrypt.hash('User1234!', 12);
  await prisma.user.upsert({
    where: { email: 'demo@sorteagora.com' },
    update: {},
    create: {
      email: 'demo@sorteagora.com',
      password: userPassword,
      firstName: 'Demo',
      lastName: 'User',
      role: 'USER',
      isVerified: true,
      referralCode: 'DEMO0001',
      vipPoints: 100,
      account: {
        create: {
          currency: 'BRL',
          balance: 100,
        },
      },
    },
  });

  console.log('Seed complete.');
  console.log('Admin:', admin.email, '/ Admin123!');
  console.log('Demo user: demo@sorteagora.com / User1234!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
