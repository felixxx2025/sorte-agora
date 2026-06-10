# API Documentation - SORTE AGORA

## Base URL
```
http://localhost:3001/api
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## Endpoints

### Authentication

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "phone": "+5511999999999",
  "firstName": "John",
  "lastName": "Doe",
  "currency": "BRL"
}
```

**Response:**
```json
{
  "user": {
    "id": "clxxx",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "message": "Registration successful"
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

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clxxx",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

#### Refresh Token
```http
POST /auth/refresh
Authorization: Bearer <refresh_token>
```

#### Logout
```http
POST /auth/logout
Authorization: Bearer <access_token>
```

### Users

#### Get Profile
```http
GET /users/profile
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "id": "clxxx",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+5511999999999",
  "country": "BR",
  "currency": "BRL",
  "isVerified": true,
  "isKycVerified": false,
  "vipPoints": 0,
  "account": {
    "balance": 1000.00,
    "bonusBalance": 100.00,
    "lockedBalance": 0.00,
    "currency": "BRL"
  }
}
```

#### Update Profile
```http
PUT /users/profile
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+5511888888888"
}
```

### Financial

#### Get Balance
```http
GET /financial/balance
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "balance": 1000.00,
  "bonusBalance": 100.00,
  "lockedBalance": 0.00,
  "currency": "BRL"
}
```

#### Create Deposit
```http
POST /financial/deposit
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "amount": 100.00,
  "pixKey": "user-pix-key"
}
```

**Response:**
```json
{
  "transactionId": "clxxx",
  "pixCode": "00020126580014br.gov.bcb.pix...",
  "qrCode": "data:image/png;base64,...",
  "amount": 100.00,
  "expiresAt": "2024-01-01T12:15:00Z"
}
```

#### Create Withdrawal
```http
POST /financial/withdraw
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "amount": 50.00,
  "pixKey": "user-pix-key"
}
```

**Response:**
```json
{
  "transactionId": "clxxx",
  "amount": 50.00,
  "status": "PENDING"
}
```

#### Get Transactions
```http
GET /financial/transactions
Authorization: Bearer <access_token>
```

**Response:**
```json
[
  {
    "id": "clxxx",
    "type": "DEPOSIT",
    "amount": 100.00,
    "method": "PIX",
    "status": "COMPLETED",
    "createdAt": "2024-01-01T12:00:00Z"
  }
]
```

### Casino

#### Get Games
```http
GET /casino/games?category=SLOTS
```

**Response:**
```json
[
  {
    "id": "clxxx",
    "provider": "NETENT",
    "name": "Starburst",
    "category": "SLOTS",
    "thumbnail": "https://cdn.sorteagora.com/games/starburst.jpg",
    "rtp": 96.09,
    "minBet": 0.10,
    "maxBet": 100.00,
    "isActive": true
  }
]
```

#### Get Game
```http
GET /casino/games/:id
```

#### Launch Game
```http
POST /casino/games/:id/launch
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "userId": "clxxx"
}
```

**Response:**
```json
{
  "sessionId": "clxxx",
  "gameUrl": "https://provider.example.com/games/xyz?token=abc123",
  "expiresAt": "2024-01-02T12:00:00Z"
}
```

#### Get Sessions
```http
GET /casino/sessions
Authorization: Bearer <access_token>
```

### Sports

#### Get Events
```http
GET /sports/events?isLive=true
```

**Response:**
```json
[
  {
    "id": "clxxx",
    "name": "Manchester City vs Liverpool",
    "startTime": "2024-01-01T15:00:00Z",
    "isLive": true,
    "status": "LIVE",
    "markets": [
      {
        "id": "clxxx",
        "name": "Match Winner",
        "selections": [
          {
            "id": "clxxx",
            "name": "Manchester City",
            "odds": 1.85
          },
          {
            "id": "clxxx",
            "name": "Draw",
            "odds": 3.40
          },
          {
            "id": "clxxx",
            "name": "Liverpool",
            "odds": 4.20
          }
        ]
      }
    ]
  }
]
```

#### Get Event
```http
GET /sports/events/:id
```

#### Place Bet
```http
POST /sports/bets
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "userId": "clxxx",
  "selectionId": "clxxx",
  "stake": 50.00
}
```

**Response:**
```json
{
  "betId": "clxxx",
  "potentialWin": 92.50,
  "status": "PENDING"
}
```

#### Get Bets
```http
GET /sports/bets
Authorization: Bearer <access_token>
```

### VIP

#### Get VIP Status
```http
GET /vip/status
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "level": {
    "id": "clxxx",
    "name": "Silver",
    "level": 1,
    "pointsRequired": 1000,
    "cashbackPercent": 7.00
  },
  "points": 500,
  "nextLevel": {
    "name": "Gold",
    "pointsRequired": 5000
  },
  "progress": 10.00
}
```

#### Get VIP Levels
```http
GET /vip/levels
Authorization: Bearer <access_token>
```

#### Get Missions
```http
GET /vip/missions
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "daily": [
    {
      "id": "1",
      "title": "Faça 10 apostas",
      "description": "Complete 10 apostas em qualquer jogo",
      "reward": 50,
      "progress": 5,
      "target": 10,
      "completed": false
    }
  ],
  "weekly": [
    {
      "id": "3",
      "title": "Jogue 3 jogos ao vivo",
      "description": "Jogue 3 jogos de cassino ao vivo",
      "reward": 75,
      "progress": 1,
      "target": 3,
      "completed": false
    }
  ]
}
```

### Affiliates

#### Register Affiliate
```http
POST /affiliates/register
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "commissionType": "REVENUE_SHARE",
  "commissionRate": 25.00
}
```

**Response:**
```json
{
  "affiliateId": "clxxx",
  "trackingCode": "ABC123",
  "referralLink": "https://sorteagora.com/?ref=ABC123"
}
```

#### Get Dashboard
```http
GET /affiliates/dashboard
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "totalReferrals": 100,
  "activeReferrals": 45,
  "totalCommission": 5000.00,
  "pendingCommission": 250.00,
  "paidCommission": 4750.00,
  "conversionRate": 45.00
}
```

#### Get Commissions
```http
GET /affiliates/commissions
Authorization: Bearer <access_token>
```

### Admin

#### Get Dashboard
```http
GET /admin/dashboard
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "totalUsers": 12345,
  "totalTransactions": 45678,
  "totalBets": 123456,
  "totalSessions": 78901
}
```

#### Get Users
```http
GET /admin/users
Authorization: Bearer <access_token>
```

#### Ban User
```http
PUT /admin/users/:id/ban
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "reason": "Fraud detected"
}
```

#### Unban User
```http
PUT /admin/users/:id/unban
Authorization: Bearer <access_token>
```

#### Get Transactions
```http
GET /admin/financial/transactions
Authorization: Bearer <access_token>
```

#### Get Pending Withdrawals
```http
GET /admin/financial/withdrawals
Authorization: Bearer <access_token>
```

#### Approve Withdrawal
```http
PUT /admin/financial/withdrawals/:id/approve
Authorization: Bearer <access_token>
```

#### Reject Withdrawal
```http
PUT /admin/financial/withdrawals/:id/reject
Authorization: Bearer <access_token>
```

#### Get Reports
```http
GET /admin/reports
Authorization: Bearer <access_token>
```

#### Create Bonus
```http
POST /admin/bonuses
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Welcome Bonus",
  "description": "100% up to R$ 100",
  "type": "WELCOME",
  "amount": 100.00,
  "percentage": 100.00,
  "maxAmount": 100.00,
  "wagerMultiplier": 30,
  "validFrom": "2024-01-01T00:00:00Z",
  "isActive": true
}
```

#### Update Bonus
```http
PUT /admin/bonuses/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "isActive": false
}
```

#### Delete Bonus
```http
DELETE /admin/bonuses/:id
Authorization: Bearer <access_token>
```

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "statusCode": 400,
  "message": "Bad Request",
  "error": "Invalid input data"
}
```

### Common Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## Rate Limiting
- **Default**: 100 requests per minute per IP
- **Login**: 5 requests per minute per IP
- **Deposit/Withdraw**: 10 requests per minute per user

## Webhooks

### Transaction Status Update
The platform can send webhook notifications when transaction status changes.

**Payload:**
```json
{
  "event": "transaction.updated",
  "data": {
    "transactionId": "clxxx",
    "type": "DEPOSIT",
    "status": "COMPLETED",
    "amount": 100.00,
    "userId": "clxxx"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## SDK Examples

### JavaScript/TypeScript
```typescript
import apiClient from './lib/api/client';

// Login
const login = async (email: string, password: string) => {
  const response = await apiClient.post('/auth/login', { email, password });
  localStorage.setItem('accessToken', response.data.accessToken);
  return response.data;
};

// Get Balance
const getBalance = async () => {
  const response = await apiClient.get('/financial/balance');
  return response.data;
};

// Place Bet
const placeBet = async (selectionId: string, stake: number) => {
  const response = await apiClient.post('/sports/bets', {
    selectionId,
    stake,
  });
  return response.data;
};
```

## Swagger UI
Interactive API documentation available at:
```
http://localhost:3001/api/docs
```
