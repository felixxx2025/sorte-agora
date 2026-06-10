# Setup Instructions - SORTE AGORA

## Prerequisites

- Node.js 18+
- Docker 24+
- Docker Compose 2+
- PostgreSQL 16+ (if not using Docker)
- Redis 7+ (if not using Docker)

## Quick Start (Docker)

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/sorte-agora.git
cd sorte-agora
```

### 2. Configure Environment Variables
```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
```

Edit the `.env` files with your configuration:
- Database credentials
- JWT secrets
- API keys for external services

### 3. Start All Services
```bash
docker-compose up -d
```

This will start:
- PostgreSQL (port 5432)
- Redis (port 6379)
- Backend API (port 3001)
- Frontend (port 3000)

### 4. Run Database Migrations
```bash
docker-compose exec backend npx prisma migrate dev
```

### 5. Seed Database (Optional)
```bash
docker-compose exec backend npx prisma db seed
```

### 6. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api
- API Documentation: http://localhost:3001/api/docs

## Manual Setup

### Backend Setup

#### 1. Install Dependencies
```bash
cd backend
npm install
```

#### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your configuration
```

#### 3. Setup Database
```bash
# Using PostgreSQL
createdb sorte_agora

# Run migrations
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate
```

#### 4. Start Backend
```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

### Frontend Setup

#### 1. Install Dependencies
```bash
cd frontend
npm install
```

#### 2. Configure Environment
```bash
cp .env.local.example .env.local
# Edit .env.local with your configuration
```

#### 3. Start Frontend
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## Development Workflow

### Backend Development

```bash
cd backend

# Watch mode with hot reload
npm run start:dev

# Run tests
npm run test

# Run tests with coverage
npm run test:cov

# Run linter
npm run lint

# Format code
npm run format

# Open Prisma Studio (database GUI)
npx prisma studio
```

### Frontend Development

```bash
cd frontend

# Watch mode with hot reload
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Type check
npm run type-check
```

## Database Management

### Create New Migration
```bash
cd backend
npx prisma migrate dev --name migration_name
```

### Reset Database
```bash
cd backend
npx prisma migrate reset
```

### View Database
```bash
cd backend
npx prisma studio
```

### Seed Database
```bash
cd backend
npx prisma db seed
```

## Testing

### Backend Tests
```bash
cd backend

# Unit tests
npm run test

# Integration tests
npm run test:e2e

# Coverage
npm run test:cov
```

### Frontend Tests
```bash
cd frontend

# E2E tests (Playwright)
npx playwright test
```

## Production Deployment

### Build Docker Images
```bash
docker-compose build
```

### Push to Registry
```bash
docker push sorte-agora-backend:latest
docker push sorte-agora-frontend:latest
```

### Deploy to Kubernetes
```bash
kubectl apply -f k8s/production/
```

## Troubleshooting

### Backend Won't Start
- Check if PostgreSQL is running
- Verify DATABASE_URL in .env
- Check port 3001 is not in use

### Frontend Won't Start
- Check if backend is running
- Verify NEXT_PUBLIC_API_URL in .env.local
- Check port 3000 is not in use

### Database Connection Issues
- Verify PostgreSQL credentials
- Check if PostgreSQL is accepting connections
- Test with: `psql -h localhost -U sorteagora -d sorte_agora`

### Redis Connection Issues
- Verify Redis is running
- Check REDIS_URL in .env
- Test with: `redis-cli ping`

## Environment Variables Reference

### Backend (.env)
- `NODE_ENV` - Node environment (development/production)
- `PORT` - Server port (default: 3001)
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - Secret for JWT signing
- `JWT_EXPIRES_IN` - Access token expiration
- `JWT_REFRESH_EXPIRES_IN` - Refresh token expiration
- `ENCRYPTION_KEY` - Encryption key for sensitive data
- `CORS_ORIGIN` - Allowed CORS origins
- `JAEGER_ENDPOINT` - Jaeger tracing endpoint
- `SENTRY_DSN` - Sentry error tracking DSN

### Frontend (.env.local)
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_WS_URL` - WebSocket URL
- `NEXT_PUBLIC_CDN_URL` - CDN URL for assets
- `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` - Google Analytics ID
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` - reCAPTCHA site key

## Security Notes

### Before Production
1. Change all default passwords
2. Generate strong JWT secrets
3. Set up proper SSL/TLS certificates
4. Configure firewall rules
5. Enable rate limiting
6. Set up monitoring and alerts
7. Configure backup strategy
8. Review and update CORS settings

### Recommended Secrets Generation
```bash
# Generate JWT secret
openssl rand -base64 32

# Generate encryption key
openssl rand -hex 32
```

## Support

For issues and questions:
- Documentation: /docs
- API Docs: http://localhost:3001/api/docs
- Email: support@sorteagora.com
