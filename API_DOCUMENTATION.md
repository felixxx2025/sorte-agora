# Documentação da API - SORTE AGORA
**Versão:** 1.0.0
**Base URL:** `https://api.yourdomain.com/api`
**Swagger UI:** `https://api.yourdomain.com/api/docs`

---

## Autenticação

A API usa JWT (JSON Web Tokens) para autenticação. Inclua o token no header `Authorization`:

```
Authorization: Bearer <token>
```

### Endpoints Públicos
- `POST /auth/register` - Registro de usuário
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh token
- `POST /auth/forgot-password` - Solicitar recuperação de senha
- `POST /auth/reset-password` - Redefinir senha

### Endpoints Protegidos
Todos os outros endpoints requerem autenticação JWT.

---

## Módulos

### Autenticação (`/auth`)

#### Registro
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "phone": "+5511999999999",
  "firstName": "João",
  "lastName": "Silva",
  "currency": "BRL"
}
```

**Resposta (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clxxx",
      "email": "user@example.com",
      "role": "USER"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clxxx",
      "email": "user@example.com",
      "role": "USER"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### Logout
```http
POST /auth/logout
Authorization: Bearer <token>
```

---

### Usuários (`/users`)

#### Perfil do Usuário
```http
GET /users/profile
Authorization: Bearer <token>
```

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "id": "clxxx",
    "email": "user@example.com",
    "firstName": "João",
    "lastName": "Silva",
    "phone": "+5511999999999",
    "currency": "BRL",
    "role": "USER",
    "isKycVerified": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Atualizar Perfil
```http
PATCH /users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "João",
  "lastName": "Silva",
  "phone": "+5511999999999"
}
```

---

### Financeiro (`/financial`)

#### Saldo
```http
GET /financial/balance
Authorization: Bearer <token>
```

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "balance": 1000.00,
    "bonusBalance": 50.00,
    "lockedBalance": 0.00,
    "currency": "BRL"
  }
}
```

#### Depósito
```http
POST /financial/deposit
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 100.00,
  "pixKey": "your-pix-key"
}
```

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "transaction": {
      "id": "clxxx",
      "type": "DEPOSIT",
      "amount": 100.00,
      "status": "PENDING",
      "pixCode": "00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-426614174000",
      "qrCode": "data:image/png;base64,..."
    }
  }
}
```

#### Saque
```http
POST /financial/withdraw
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 50.00,
  "pixKey": "your-pix-key"
}
```

#### Histórico de Transações
```http
GET /financial/transactions
Authorization: Bearer <token>
```

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "clxxx",
        "type": "DEPOSIT",
        "amount": 100.00,
        "status": "COMPLETED",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "pages": 1
  }
}
```

---

### Casino (`/casino`)

#### Listar Jogos
```http
GET /casino/games
Authorization: Bearer <token>
```

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "games": [
      {
        "id": "clxxx",
        "name": "Roulette Royale",
        "provider": "Evolution",
        "category": "TABLE",
        "minBet": 1.00,
        "maxBet": 1000.00,
        "rtp": 97.3,
        "imageUrl": "https://cdn.example.com/roulette.jpg"
      }
    ]
  }
}
```

#### Lançar Jogo
```http
POST /casino/games/{gameId}/launch
Authorization: Bearer <token>
```

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "gameUrl": "https://provider.com/game?token=...",
    "sessionToken": "clxxx"
  }
}
```

#### Sessões do Usuário
```http
GET /casino/sessions
Authorization: Bearer <token>
```

---

### Apostas Esportivas (`/sports`)

#### Listar Eventos
```http
GET /sports/events
Authorization: Bearer <token>
Query Parameters:
  - live: boolean (filtar eventos ao vivo)
  - sport: string (filtar por esporte)
```

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "clxxx",
        "name": "Flamengo vs Palmeiras",
        "sport": "FOOTBALL",
        "startTime": "2024-01-01T20:00:00.000Z",
        "isLive": true,
        "status": "OPEN",
        "markets": [
          {
            "id": "clxxx",
            "name": "Resultado Final",
            "selections": [
              {
                "id": "clxxx",
                "name": "Flamengo",
                "odds": 2.10
              }
            ]
          }
        ]
      }
    ]
  }
}
```

#### Detalhes do Evento
```http
GET /sports/events/{eventId}
Authorization: Bearer <token>
```

#### Realizar Aposta
```http
POST /sports/bets
Authorization: Bearer <token>
Content-Type: application/json

{
  "eventId": "clxxx",
  "selectionId": "clxxx",
  "stake": 50.00,
  "odds": 2.10
}
```

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "bet": {
      "id": "clxxx",
      "eventId": "clxxx",
      "selectionId": "clxxx",
      "stake": 50.00,
      "odds": 2.10,
      "potentialWin": 105.00,
      "status": "PENDING"
    }
  }
}
```

#### Apostas do Usuário
```http
GET /sports/bets
Authorization: Bearer <token>
```

---

### VIP (`/vip`)

#### Status VIP
```http
GET /vip/status
Authorization: Bearer <token>
```

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "level": {
      "id": "clxxx",
      "name": "Gold",
      "level": 3,
      "pointsRequired": 10000,
      "cashbackPercent": 5.0,
      "bonusAmount": 500.00
    },
    "points": 7500,
    "progress": 75.0
  }
}
```

#### Níveis VIP
```http
GET /vip/levels
Authorization: Bearer <token>
```

#### Missões VIP
```http
GET /vip/missions
Authorization: Bearer <token>
```

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "daily": [
      {
        "id": "clxxx",
        "title": "Apostar R$ 100",
        "description": "Realize apostas totais de R$ 100",
        "reward": 100,
        "progress": 50,
        "target": 100
      }
    ],
    "weekly": [...]
  }
}
```

---

### Afiliados (`/affiliates`)

#### Registro de Afiliado
```http
POST /affiliates/register
Authorization: Bearer <token>
Content-Type: application/json

{
  "paymentMethod": "PIX",
  "pixKey": "your-pix-key"
}
```

#### Dashboard de Afiliado
```http
GET /affiliates/dashboard
Authorization: Bearer <token>
```

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "trackingCode": "ABC123",
    "totalReferrals": 50,
    "activeReferrals": 30,
    "totalCommission": 1500.00,
    "pendingCommission": 200.00,
    "commissions": [...]
  }
}
```

---

### Admin (`/admin`)

**Requer role: ADMIN**

#### Dashboard Admin
```http
GET /admin/dashboard
Authorization: Bearer <token>
```

#### Listar Usuários
```http
GET /admin/users
Authorization: Bearer <token>
Query Parameters:
  - page: number
  - limit: number
  - search: string
```

#### Banir Usuário
```http
POST /admin/users/{userId}/ban
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Violação dos termos",
  "banDuration": 7
}
```

#### Desbanir Usuário
```http
POST /admin/users/{userId}/unban
Authorization: Bearer <token>
```

#### Gerenciar Bônus
```http
POST /admin/bonuses
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Bônus de Boas-vindas",
  "description": "100% até R$ 500",
  "type": "WELCOME",
  "amount": 500.00,
  "percentage": 100,
  "wagerMultiplier": 30
}
```

#### Transações Pendentes
```http
GET /admin/transactions/pending
Authorization: Bearer <token>
```

#### Aprovar Saque
```http
POST /admin/transactions/{transactionId}/approve
Authorization: Bearer <token>
```

#### Rejeitar Saque
```http
POST /admin/transactions/{transactionId}/reject
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Documentação insuficiente"
}
```

---

### Health Check

```http
GET /health
```

**Resposta (200):**
```json
{
  "status": "ok",
  "database": "connected"
}
```

---

### Métricas Prometheus

```http
GET /metrics
```

Retorna métricas em formato Prometheus para scraping.

---

## Códigos de Status HTTP

- `200 OK` - Requisição bem-sucedida
- `201 Created` - Recurso criado
- `400 Bad Request` - Requisição inválida
- `401 Unauthorized` - Não autenticado
- `403 Forbidden` - Sem permissão
- `404 Not Found` - Recurso não encontrado
- `409 Conflict` - Conflito (ex: email já existe)
- `422 Unprocessable Entity` - Validação falhou
- `429 Too Many Requests` - Rate limit excedido
- `500 Internal Server Error` - Erro no servidor

## Rate Limiting

- **Default:** 100 requisições por minuto por IP
- **Authenticated:** 200 requisições por minuto por usuário
- **Admin:** 500 requisições por minuto

## Paginação

Endpoints que retornam listas suportam paginação:

```
GET /resource?page=1&limit=20
```

**Resposta:**
```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "pages": 5
}
```

## Erros

### Formato de Erro
```json
{
  "success": false,
  "statusCode": 400,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/auth/login",
  "method": "POST",
  "message": "Validation failed",
  "details": [...]
}
```

### Erros Comuns

| Código | Mensagem | Causa |
|--------|----------|-------|
| `INVALID_CREDENTIALS` | Credenciais inválidas | Email ou senha incorretos |
| `USER_NOT_FOUND` | Usuário não encontrado | ID de usuário inválido |
| `EMAIL_ALREADY_EXISTS` | Email já cadastrado | Tentativa de registro com email existente |
| `INSUFFICIENT_BALANCE` | Saldo insuficiente | Tentativa de saque/aposta maior que saldo |
| `INVALID_BET_AMOUNT` | Valor de aposta inválido | Valor abaixo do mínimo ou acima do máximo |
| `GAME_NOT_FOUND` | Jogo não encontrado | ID de jogo inválido |
| `EVENT_CLOSED` | Evento fechado | Tentativa de aposta em evento fechado |

## Webhooks

### Webhook de Transação
Configurar webhook para receber notificações de transações:

```json
{
  "event": "transaction.completed",
  "data": {
    "transactionId": "clxxx",
    "type": "DEPOSIT",
    "amount": 100.00,
    "status": "COMPLETED",
    "userId": "clxxx"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## SDKs e Bibliotecas

### JavaScript/TypeScript
```bash
npm install @sorte-agora/sdk
```

```typescript
import { SorteAgoraClient } from '@sorte-agora/sdk';

const client = new SorteAgoraClient({
  apiKey: 'your-api-key',
  baseURL: 'https://api.yourdomain.com/api'
});

// Login
const { user, accessToken } = await client.auth.login({
  email: 'user@example.com',
  password: 'password123'
});

// Obter saldo
const balance = await client.financial.getBalance();
```

---

## Suporte

Para suporte da API:
- Documentação: `https://docs.yourdomain.com`
- Status: `https://status.yourdomain.com`
- Email: `api-support@sorteagora.com`
- Discord: `https://discord.gg/sorteagora`

---

## Changelog da API

### v1.0.0 (2024-01-01)
- Release inicial da API
- Módulos: Auth, Users, Financial, Casino, Sports, VIP, Affiliates, Admin
- Autenticação JWT
- Rate limiting
- Health checks
- Métricas Prometheus
