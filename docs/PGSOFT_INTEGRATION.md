# Integração PG Soft

## Visão geral

O SORTE AGORA integra jogos **PG Soft** via:

1. **Catálogo** — `provider: PGSOFT` + `providerGameId` (IDs oficiais)
2. **Launch** — `PgSoftCasinoProvider` (`GetLaunchURLHTML` ou sandbox local)
3. **Wallet seamless** — callbacks em `/api/pgsoft/*`

Roteamento: jogos com `provider=PGSOFT` sempre usam o adapter PG Soft, independente de `CASINO_PROVIDER_MODE`.

## Variáveis de ambiente

```bash
PGSOFT_API_BASE_URL=https://api.pg-bo.me   # ou URL do parceiro
PGSOFT_OPERATOR_TOKEN=seu_operator_token
PGSOFT_SECRET_KEY=                        # opcional
PGSOFT_LAUNCH_PATH=/external-game-launcher/api/v1/GetLaunchURLHTML
PGSOFT_LANG=pt
PGSOFT_CURRENCY=BRL
```

Sem `PGSOFT_API_BASE_URL` + `PGSOFT_OPERATOR_TOKEN`, o launch abre `/casino/play` em **sandbox** (sessão + saldo SA intactos para testes de catálogo/UI).

## Callbacks (configure no backoffice PG Soft)

Base URL do operador: `https://SEU_DOMINIO/api/pgsoft`

| Endpoint | Uso |
|----------|-----|
| `POST /VerifySession` | Valida `operator_player_session` (= sessionToken SA) |
| `POST /Cash/Get` | Saldo da conta |
| `POST /Cash/TransferInOut` | Débito/crédito (`transfer_amount` negativo = aposta) |

Resposta no formato PG Soft: `{ data: {...}, error: null | { code, message } }`.

## Catálogo

- Fonte: `backend/src/modules/casino/data/pgsoft-games.json` (**149 jogos**, IDs de launch = `pgid` oficial)
- Seed e `POST /api/casino/pgsoft/sync` (ADMIN) fazem upsert do catálogo completo
- Thumbs: CDN pública PG Soft (`public.pg-demo.com` / assets oficiais)
- Atualizar catálogo: refetch `https://api.pgsoft.com/Game/GetDefaultAllGame/language/pt-BR` → regenerar o JSON

## Frontend

- Filtro **PG Soft** em `/casino?provider=PGSOFT`
- SideLobby → item “PG Soft”
- Launch: `POST /casino/games/:id/launch` → `gameUrl` do provedor

## Go-live checklist

1. Credenciais do Account Manager PG Soft
2. Preencher env no Compose / `.env`
3. Apontar wallet callbacks para a API pública
4. Testar VerifySession → Get → TransferInOut com 1 jogo
5. `POST /api/casino/pgsoft/sync` (ou seed) para garantir os 149 jogos
6. Rebuild: `docker compose up -d --build backend frontend`
