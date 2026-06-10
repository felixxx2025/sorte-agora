# Guia de Deployment - SORTE AGORA
**Versão:** 1.0.0
**Data:** 1 de Junho de 2026

---

## Pré-requisitos

### Infraestrutura Mínima
- **CPU:** 4 vCPUs
- **RAM:** 8 GB
- **Armazenamento:** 50 GB SSD
- **Banco de Dados:** PostgreSQL 15+
- **Cache:** Redis 7+
- **Node.js:** 20.x
- **Docker:** 24.x
- **Docker Compose:** 2.x

### Software Necessário
- Git
- Docker & Docker Compose
- Node.js 20.x
- npm ou yarn
- pnpm (opcional, para builds mais rápidos)

---

## Variáveis de Ambiente

### Backend (.env)
```bash
NODE_ENV=production
PORT=3001
API_PREFIX=/api

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/sorte_agora?schema=public"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Encryption
ENCRYPTION_KEY="your-32-byte-hex-key-change-in-production"

# CORS
CORS_ORIGIN="https://yourdomain.com"

# External Services
PIX_API_KEY="your-pix-api-key"
CASINO_PROVIDER_API_KEY="your-casino-provider-key"
SPORTS_ODDS_API_KEY="your-sports-odds-key"

# Email
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="noreply@sorteagora.com"
SMTP_PASSWORD="your-smtp-password"

# SMS
SMS_API_KEY="your-sms-api-key"
SMS_API_SECRET="your-sms-secret"

# Storage
S3_BUCKET="sorte-agora-uploads"
S3_REGION="us-east-1"
S3_ACCESS_KEY="your-access-key"
S3_SECRET_KEY="your-secret-key"

# Monitoring
SENTRY_DSN="your-sentry-dsn"
JAEGER_ENDPOINT="http://localhost:4318/v1/traces"

# Security
RECAPTCHA_SECRET="your-recaptcha-secret"
RATE_LIMIT_REDIS_URL="redis://localhost:6379"

# Features
ENABLE_CASINO=true
ENABLE_SPORTS=true
ENABLE_VIP=true
ENABLE_AFFILIATES=true
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL="https://api.yourdomain.com"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

---

## Deployment Local com Docker Compose

### 1. Clonar o Repositório
```bash
git clone <repository-url>
cd windsurf-project
```

### 2. Configurar Variáveis de Ambiente
```bash
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
# Editar os arquivos .env com suas configurações
```

### 3. Iniciar Serviços
```bash
docker-compose up -d
```

### 4. Executar Migrations
```bash
docker-compose exec backend npx prisma migrate deploy
```

### 5. Verificar Status
```bash
docker-compose ps
docker-compose logs -f
```

### 6. Acessar Aplicação
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api
- Swagger Docs: http://localhost:3001/api/docs
- Health Check: http://localhost:3001/api/health
- Prometheus Metrics: http://localhost:3001/api/metrics

---

## Deployment em Produção

### Opção 1: Docker Compose (Simples)

#### 1. Preparar Servidor
```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Instalar Nginx
sudo apt install nginx -y
```

#### 2. Configurar Nginx
```nginx
# /etc/nginx/sites-available/sorte-agora
upstream backend {
    server localhost:3001;
}

upstream frontend {
    server localhost:3000;
}

server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Health Check
    location /health {
        proxy_pass http://backend/api/health;
        access_log off;
    }
}
```

#### 3. Habilitar Site
```bash
sudo ln -s /etc/nginx/sites-available/sorte-agora /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 4. Configurar SSL com Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com
```

#### 5. Deploy
```bash
# Copiar arquivos para servidor
scp -r . user@server:/var/www/sorte-agora

# No servidor
cd /var/www/sorte-agora
docker-compose up -d --build
docker-compose exec backend npx prisma migrate deploy
```

---

### Opção 2: Kubernetes (Escalável)

#### 1. Criar Namespace
```bash
kubectl create namespace sorte-agora
```

#### 2. Criar Secrets
```bash
kubectl create secret generic sorte-agora-secrets \
  --from-literal=database-url="postgresql://..." \
  --from-literal=jwt-secret="..." \
  --from-literal=redis-url="..." \
  -n sorte-agora
```

#### 3. Deploy PostgreSQL
```yaml
# k8s/postgres-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
  namespace: sorte-agora
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15
        env:
        - name: POSTGRES_DB
          value: sorte_agora
        - name: POSTGRES_USER
          valueFrom:
            secretKeyRef:
              name: sorte-agora-secrets
              key: database-url
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
      volumes:
      - name: postgres-storage
        persistentVolumeClaim:
          claimName: postgres-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: postgres
  namespace: sorte-agora
spec:
  selector:
    app: postgres
  ports:
  - port: 5432
    targetPort: 5432
```

#### 4. Deploy Redis
```yaml
# k8s/redis-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
  namespace: sorte-agora
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
      - name: redis
        image: redis:7
        ports:
        - containerPort: 6379
---
apiVersion: v1
kind: Service
metadata:
  name: redis
  namespace: sorte-agora
spec:
  selector:
    app: redis
  ports:
  - port: 6379
    targetPort: 6379
```

#### 5. Deploy Backend
```yaml
# k8s/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: sorte-agora
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: sorteagora/backend:latest
        ports:
        - containerPort: 3001
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: sorte-agora-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: sorte-agora-secrets
              key: redis-url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: sorte-agora-secrets
              key: jwt-secret
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: backend
  namespace: sorte-agora
spec:
  selector:
    app: backend
  ports:
  - port: 3001
    targetPort: 3001
  type: ClusterIP
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
  namespace: sorte-agora
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

#### 6. Deploy Frontend
```yaml
# k8s/frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: sorte-agora
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: sorteagora/frontend:latest
        ports:
        - containerPort: 3000
        env:
        - name: NEXT_PUBLIC_API_URL
          value: "https://api.yourdomain.com"
        livenessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: frontend
  namespace: sorte-agora
spec:
  selector:
    app: frontend
  ports:
  - port: 3000
    targetPort: 3000
  type: ClusterIP
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: frontend-hpa
  namespace: sorte-agora
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: frontend
  minReplicas: 2
  maxReplicas: 5
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

#### 7. Ingress
```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: sorte-agora-ingress
  namespace: sorte-agora
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  tls:
  - hosts:
    - yourdomain.com
    secretName: sorte-agora-tls
  rules:
  - host: yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend
            port:
              number: 3000
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: backend
            port:
              number: 3001
```

#### 8. Aplicar Manifestos
```bash
kubectl apply -f k8s/postgres-deployment.yaml
kubectl apply -f k8s/redis-deployment.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/ingress.yaml
```

---

## Monitoramento

### Health Checks
```bash
# Backend
curl https://api.yourdomain.com/api/health

# Frontend
curl https://yourdomain.com
```

### Logs
```bash
# Docker Compose
docker-compose logs -f backend
docker-compose logs -f frontend

# Kubernetes
kubectl logs -f deployment/backend -n sorte-agora
kubectl logs -f deployment/frontend -n sorte-agora
```

### Métricas Prometheus
```bash
curl https://api.yourdomain.com/api/metrics
```

### Traces Jaeger
Acessar Jaeger UI em: `http://jaeger.yourdomain.com`

### Sentry Dashboard
Acessar Sentry em: `https://sentry.io`

---

## Backup e Restore

### Backup do Banco de Dados
```bash
# Backup
docker-compose exec postgres pg_dump -U sorteagora sorte_agora > backup.sql

# Restore
docker-compose exec -T postgres psql -U sorteagora sorte_agora < backup.sql
```

### Backup de Volumes
```bash
# Backup volumes
docker run --rm -v sorte-agora_postgres_data:/data -v $(pwd):/backup ubuntu tar czf /backup/postgres-backup.tar.gz /data

# Restore volumes
docker run --rm -v sorte-agora_postgres_data:/data -v $(pwd):/backup ubuntu tar xzf /backup/postgres-backup.tar.gz -C /
```

---

## Rollback

### Docker Compose
```bash
# Reverter para versão anterior
docker-compose down
docker-compose up -d --build
```

### Kubernetes
```bash
# Reverter deployment
kubectl rollout undo deployment/backend -n sorte-agora
kubectl rollout undo deployment/frontend -n sorte-agora

# Verificar status
kubectl rollout status deployment/backend -n sorte-agora
```

---

## Troubleshooting

### Backend não inicia
```bash
# Verificar logs
docker-compose logs backend

# Verificar conexão com banco
docker-compose exec backend npx prisma db push

# Verificar variáveis de ambiente
docker-compose config
```

### Frontend não carrega
```bash
# Verificar logs
docker-compose logs frontend

# Verificar conexão com API
curl http://localhost:3001/api/health

# Rebuild
docker-compose up -d --build frontend
```

### Erro de Migrations
```bash
# Reset database (CUIDADO: apaga dados)
docker-compose exec backend npx prisma migrate reset

# Deploy migrations
docker-compose exec backend npx prisma migrate deploy
```

---

## Segurança em Produção

### Firewall
```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### Rate Limiting
Já configurado no backend com @nestjs/throttler.

### Security Headers
Já configurado com Helmet.

### HTTPS
Configurar SSL/TLS com Let's Encrypt ou certificado próprio.

---

## Performance

### Otimizações Aplicadas
- Multi-stage Docker builds
- Next.js SWC minification
- CSS optimization
- Package import optimization
- Database indexes
- Redis caching
- CDN para assets estáticos

### Escalabilidade
- Horizontal Pod Autoscaler configurado
- Load balancing via Kubernetes Service
- Database connection pooling via Prisma
- Redis para cache e sessões

---

## Checklist de Deployment

### Pré-Deployment
- [ ] Variáveis de ambiente configuradas
- [ ] Secrets criados e seguros
- [ ] Banco de dados preparado
- [ ] Migrations testadas
- [ ] Backup do banco de dados realizado
- [ ] Certificados SSL configurados
- [ ] DNS configurado
- [ ] Firewall configurado
- [ ] Monitoramento configurado
- [ ] Alertas configurados

### Pós-Deployment
- [ ] Health checks passando
- [ ] Logs sem erros
- [ ] Métricas coletando
- [ ] Traces visíveis no Jaeger
- [ ] Erros visíveis no Sentry
- [ ] Testes E2E passando
- [ ] Performance aceitável
- [ ] Backup automatizado configurado
- [ ] Rollback testado
- [ ] Documentação atualizada

---

## Suporte

Para problemas de deployment:
1. Verificar logs: `docker-compose logs -f`
2. Verificar health checks: `curl /api/health`
3. Consultar documentação: `/docs`
4. Abrir issue no GitHub

---

## Próximos Passos

1. Configurar CI/CD completo
2. Implementar blue/green deployments
3. Configurar CDN global
4. Implementar disaster recovery
5. Configurar monitoring avançado
