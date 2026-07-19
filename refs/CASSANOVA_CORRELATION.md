# Correlação: Cassanova → SORTE AGORA

## Status (2026-07-19) — PARIDADE IMPLEMENTADA

Os módulos abaixo foram portados para o código de produção do SORTE AGORA (visual casa chinesa):

| Módulo | Rotas / API SA |
|--------|----------------|
| Favoritos | `/favorites` · `GET/POST /users/favorites` |
| Promoções | `/promotions` · `/promotions/[slug]` · claim |
| Detalhe jogo | `/casino/[id]` |
| Ao vivo | `/casino/live` |
| Jackpots | `JackpotTicker` · `GET /casino/jackpots` |
| KYC | `/kyc` |
| Settings + limites | `/settings` · `PUT /users/responsible-gaming` |
| Verify email | `/verify-email` |
| Deposit/Withdraw | `/deposit` `/withdraw` → wallet |
| Saque exige KYC | gate no financial |

`refs/cassanova/` permanece só como referência de leitura.

---

**Fonte trazida para:** `refs/cassanova/`  
**Upstream:** https://github.com/GizzZmo/Cassanova (MIT, demo educacional)  
**Motivo da escolha:** opção **mais completa** entre os repos avaliados (lobby + auth + promo + deposit/withdraw + KYC/2FA + dashboard + games + VIP), stack Next.js alinhada ao FE do SA.

> Cassanova **não** é “casa chinesa” visualmente (usa roxo/amarelo). Serve de **esqueleto de features e rotas**. O visual SA permanece preto/vermelho/ouro.

---

## 1. Stack

| Camada | Cassanova (`refs/cassanova`) | SORTE AGORA |
|--------|------------------------------|-------------|
| Frontend | Next.js 15 + React 19 + Tailwind 4 | Next.js 14 + React + Tailwind 3 |
| Backend | Express + MongoDB (Mongoose) | NestJS + PostgreSQL (Prisma) + Redis |
| Auth | JWT + auth-context | JWT + Zustand + AuthGuard + MFA |
| Realtime | — | Crash (Redis) + Chat (HTTP polling) |
| Pagamentos | Deposit/withdraw genéricos | PIX (sandbox/live) + wallet |

---

## 2. Rotas / páginas

| Cassanova | SORTE AGORA | Status / ação |
|-----------|-------------|---------------|
| `/` landing + hero + lobby preview | `/` landing casa chinesa | ✅ Existe — manter marca SA |
| `/login` `/register` `/forgot-password` `/reset-password` | `/(auth)/*` | ✅ Existe |
| `/verify-email` | — | 🟡 Gap opcional |
| `/dashboard` | `/home` (+ `/dashboard` → redirect) | ✅ Home lobby SA |
| `/games` + `/games/[slug]` | `/casino` + `/casino/play` | ✅ Existe (tiles densos) |
| `/live-casino` (link no Header) | `/casino?category=live` | ✅ Deep-link SideLobby |
| `/promotions` + `/promotions/[slug]` | `GET /promos` + `PromoCarousel` + admin CRUD | ✅ Carousel; 🟡 falta página `/promotions/[id]` detalhe |
| `/deposit` `/withdraw` | `/wallet` (abas depósito/saque) | ✅ Unificado em carteira “Caixa” |
| `/favorites` | — | 🟡 Gap (favoritos) |
| `/kyc` | profile / admin KYC | ✅ Parcial (admin review) |
| `/settings` | `/profile` | ✅ Parcial |
| `/vip` (nav) | `/vip` | ✅ Existe |
| — | `/crash` | ✅ Só no SA |
| — | `/sports` | ✅ Só no SA |
| — | `/affiliates` | ✅ Só no SA |
| — | ChatDock | ✅ Só no SA |
| — | `/admin` | ✅ Só no SA |

---

## 3. Componentes FE

| Cassanova | SORTE AGORA | Correlação |
|-----------|-------------|------------|
| `components/layout/Header.tsx` | `components/shell/ShellHeader.tsx` | Logo + nav + CTA; SA tem **BalancePill** + Depositar |
| `components/layout/Footer.tsx` | links em landing `/` | SA: termos/privacy/responsible/support |
| `components/home/HeroBanner.tsx` | `app/page.tsx` hero | Mesmo papel; tokens SA |
| `components/home/GameLobbyPreview.tsx` | `GameTile` + `app/casino` + home atalhos | Grid de jogos |
| `components/home/PromotionsSection.tsx` | `PromoCarousel` + `app/home` | Promo no topo do lobby |
| `components/home/JackpotTicker.tsx` | — | 🟡 Candidato a strip “ao vivo / jackpot” na home |
| `components/home/WhyChooseUs.tsx` | seção pós-hero em `/` | Opcional |
| (sem side lobby) | `SideLobby` + `BottomNav` | **SA mais completo** no chrome autenticado |
| (sem chat) | `ChatDock` | Só SA |

---

## 4. Backend / domínio

| Cassanova | SORTE AGORA | Correlação |
|-----------|-------------|------------|
| `models/User.ts` | Prisma `User` + `Account` | Usuário + saldo separado no SA |
| `models/Game.ts` | `CasinoGame` + `CasinoSession` | Catálogo + sessão |
| `models/Promotion.ts` | `PromoBanner` (+ `Bonus`) | Banner de lobby vs bônus financeiro |
| `models/Transaction.ts` | `Transaction` | Depósito/saque/crash |
| `controllers/auth.*` | `modules/auth` | Login/register/MFA/reset |
| `controllers/game.*` | `modules/casino` | Lista/launch |
| `controllers/promotion.*` | `modules/promos` + `admin` promos | Público + CRUD admin |
| `controllers/transaction.*` | `modules/financial` | PIX deposit/withdraw |
| `controllers/user.*` | `modules/users` + KYC admin | Perfil / KYC |
| — | `modules/crash` | Rodadas Redis |
| — | `modules/chat` | Salas global/support |
| — | `modules/sports` | Eventos/apostas |
| — | `modules/vip` / `affiliates` | Fidelidade / afiliados |

---

## 5. Matriz de prioridade (o que ainda dá para portar do Cassanova)

Ordem sugerida **sem** misturar marca Cassanova:

1. **JackpotTicker / Live strip** — padrão de `JackpotTicker.tsx` → reforçar strip ao vivo na `/home`
2. **Página de detalhe de promo** — espelhar `/promotions/[slug]` com dados de `PromoBanner`
3. **Favoritos** — model leve + UI no cassino (gap Cassanova→SA)
4. **Settings UX** — seções de `/settings` (limites / responsible) alinhadas a `/profile` + `/responsible`
5. **Game detail** — metadados RTP/volatilidade como em `/games/[slug]` na tela de play

**Não portar:** paleta purple/yellow, logo/textos “Cassanova”, Mongo/Express (manter Nest/Prisma).

---

## 6. Como navegar o código de referência

```text
refs/cassanova/
├── frontend/app/           # páginas Next
├── frontend/components/    # Header, Hero, Promo, Lobby
├── backend/src/            # Express + Mongoose
├── PAGES_IMPLEMENTED.md
└── PROJECT_DOCUMENTATION.md
```

App de produção permanece em `frontend/` e `backend/` na raiz do monorepo.

---

## 7. Proveniência

- Clonado em 2026-07-19 a partir de `https://github.com/GizzZmo/Cassanova.git` (shallow).
- `.git` interno removido para versionar como árvore de referência no monorepo.
- Copyright original: ver `refs/cassanova/LICENSE`.
