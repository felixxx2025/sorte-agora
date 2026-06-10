# Deployment Guide - SORTE AGORA

## Overview
Complete deployment guide for the SORTE AGORA platform across development, staging, and production environments.

## Prerequisites

### Required Tools
- Docker 24+
- Docker Compose 2+
- kubectl (for Kubernetes)
- helm (for Helm charts)
- Node.js 18+
- PostgreSQL 16+
- Redis 7+
- AWS CLI (for production)

### Required Accounts
- AWS account (production)
- Cloudflare account (CDN/DNS)
- GitHub account (CI/CD)
- Domain name

## Environment Variables

### Backend (.env)

```bash
# Application
NODE_ENV=production
PORT=3001
API_PREFIX=/api

# Database
DATABASE_URL="postgresql://user:password@host:5432/sorte_agora?schema=public"

# Redis
REDIS_URL="redis://host:6379"
REDIS_PASSWORD="your-password"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Encryption
ENCRYPTION_KEY="your-32-byte-hex-key"

# CORS
CORS_ORIGIN="https://sorteagora.com"

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
JAEGER_AGENT_HOST="jaeger-agent"
JAEGER_AGENT_PORT="6831"

# Security
RECAPTCHA_SECRET="your-recaptcha-secret"
RATE_LIMIT_REDIS_URL="redis://host:6379"

# Features
ENABLE_CASINO=true
ENABLE_SPORTS=true
ENABLE_VIP=true
ENABLE_AFFILIATES=true
```

### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL="https://api.sorteagora.com"
NEXT_PUBLIC_WS_URL="wss://api.sorteagora.com"
NEXT_PUBLIC_CDN_URL="https://cdn.sorteagora.com"
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID="G-XXXXXXXXXX"
NEXT_PUBLIC_RECAPTCHA_SITE_KEY="your-recaptcha-site-key"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="your-stripe-key"
```

## Local Development

### Using Docker Compose

```bash
# Clone repository
git clone https://github.com/your-org/sorte-agora.git
cd sorte-agora

# Copy environment files
cp .env.example .env
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env

# Start all services
docker-compose up -d

# Run database migrations
docker-compose exec backend npx prisma migrate dev

# Seed database (optional)
docker-compose exec backend npx prisma db seed

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Setup

```bash
# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Start PostgreSQL
docker run -d \
  --name sorte-agora-db \
  -e POSTGRES_USER=sorteagora \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=sorte_agora \
  -p 5432:5432 \
  postgres:16-alpine

# Start Redis
docker run -d \
  --name sorte-agora-redis \
  -p 6379:6379 \
  redis:7-alpine

# Run migrations
cd backend
npx prisma migrate dev

# Start backend
npm run start:dev

# Start frontend (new terminal)
cd frontend
npm run dev
```

## Staging Environment

### Kubernetes Deployment

```bash
# Set kubectl context
kubectl config use-context staging

# Create namespace
kubectl create namespace sorte-agora-staging

# Apply secrets
kubectl apply -f k8s/staging/secrets.yaml

# Apply configmaps
kubectl apply -f k8s/staging/configmaps.yaml

# Deploy
kubectl apply -f k8s/staging/

# Check status
kubectl get pods -n sorte-agora-staging
kubectl get services -n sorte-agora-staging
```

### Helm Chart

```bash
# Add Helm repository
helm repo add sorte-agora https://charts.sorteagora.com
helm repo update

# Install chart
helm install sorte-agora-staging sorte-agora/sorte-agora \
  --namespace sorte-agora-staging \
  --values k8s/staging/values.yaml \
  --set image.tag=staging

# Upgrade
helm upgrade sorte-agora-staging sorte-agora/sorte-agora \
  --namespace sorte-agora-staging \
  --values k8s/staging/values.yaml \
  --set image.tag=new-staging

# Rollback
helm rollback sorte-agora-staging -n sorte-agora-staging
```

## Production Environment

### AWS Infrastructure

#### VPC Setup

```bash
# Using Terraform
cd terraform/production
terraform init
terraform plan
terraform apply
```

#### EKS Cluster

```bash
# Create EKS cluster
eksctl create cluster \
  --name sorte-agora-prod \
  --region us-east-1 \
  --nodes 3 \
  --node-type t3.large \
  --managed

# Configure kubectl
aws eks update-kubeconfig --name sorte-agora-prod --region us-east-1
```

#### RDS PostgreSQL

```bash
# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier sorte-agora-db \
  --db-instance-class db.r6g.xlarge \
  --engine postgres \
  --engine-version 16.1 \
  --allocated-storage 100 \
  --master-username sorteagora \
  --master-user-password ${DB_PASSWORD} \
  --vpc-security-group-ids ${SG_ID} \
  --db-subnet-group-name sorte-agora-subnet-group \
  --backup-retention-period 30 \
  --multi-az \
  --storage-encrypted
```

#### ElastiCache Redis

```bash
# Create Redis cluster
aws elasticache create-replication-group \
  --replication-group-id sorte-agora-redis \
  --replication-group-description "Sorte Agora Redis" \
  --cache-node-type cache.r6g.large \
  --engine redis \
  --engine-version 7.0 \
  --num-cache-clusters 2 \
  --automatic-failover-enabled \
  --security-group-ids ${SG_ID}
```

#### S3 Buckets

```bash
# Create buckets
aws s3 mb s3://sorte-agora-uploads --region us-east-1
aws s3 mb s3://sorte-agora-backups --region us-east-1
aws s3 mb s3://sorte-agora-logs --region us-east-1

# Configure lifecycle rules
aws s3api put-bucket-lifecycle-configuration \
  --bucket sorte-agora-logs \
  --lifecycle-configuration file://lifecycle.json
```

### Production Deployment

```bash
# Set kubectl context
kubectl config use-context production

# Create namespace
kubectl create namespace sorte-agora-prod

# Apply secrets from AWS Secrets Manager
kubectl apply -f k8s/production/secrets.yaml

# Apply configmaps
kubectl apply -f k8s/production/configmaps.yaml

# Deploy with HPA
kubectl apply -f k8s/production/

# Configure autoscaling
kubectl autoscale deployment sorte-agora-backend \
  --namespace sorte-agora-prod \
  --cpu-percent=70 \
  --min=3 \
  --max=10

# Configure PDB
kubectl apply -f k8s/production/pod-disruption-budget.yaml
```

### Blue-Green Deployment

```bash
# Deploy new version (green)
kubectl apply -f k8s/production/backend-green.yaml

# Wait for green to be ready
kubectl rollout status deployment/sorte-agora-backend-green \
  -n sorte-agora-prod

# Switch traffic
kubectl patch service sorte-agora-backend-service \
  -n sorte-agora-prod \
  -p '{"spec":{"selector":{"version":"green"}}}'

# Monitor
kubectl get pods -n sorte-agora-prod -l version=green

# If successful, delete old version
kubectl delete deployment sorte-agora-backend-blue -n sorte-agora-prod

# If failed, rollback
kubectl patch service sorte-agora-backend-service \
  -n sorte-agora-prod \
  -p '{"spec":{"selector":{"version":"blue"}}}'
```

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Install dependencies
        run: |
          cd backend && npm install
          cd ../frontend && npm install
      - name: Run tests
        run: |
          cd backend && npm run test
          cd ../frontend && npm run test
      - name: Run linter
        run: |
          cd backend && npm run lint
          cd ../frontend && npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker images
        run: |
          docker build -t sorte-agora-backend:${{ github.sha }} ./backend
          docker build -t sorte-agora-frontend:${{ github.sha }} ./frontend
      - name: Push to registry
        run: |
          echo ${{ secrets.REGISTRY_PASSWORD }} | docker login -u ${{ secrets.REGISTRY_USER }} --password-stdin
          docker push sorte-agora-backend:${{ github.sha }}
          docker push sorte-agora-frontend:${{ github.sha }}

  deploy-staging:
    needs: build
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to staging
        run: |
          kubectl set image deployment/sorte-agora-backend \
            backend=sorte-agora-backend:${{ github.sha }} \
            -n sorte-agora-staging
          kubectl set image deployment/sorte-agora-frontend \
            frontend=sorte-agora-frontend:${{ github.sha }} \
            -n sorte-agora-staging

  deploy-production:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: |
          kubectl set image deployment/sorte-agora-backend \
            backend=sorte-agora-backend:${{ github.sha }} \
            -n sorte-agora-prod
          kubectl set image deployment/sorte-agora-frontend \
            frontend=sorte-agora-frontend:${{ github.sha }} \
            -n sorte-agora-prod
```

## Monitoring & Observability

### Prometheus Setup

```yaml
# prometheus-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
    scrape_configs:
      - job_name: 'sorte-agora-backend'
        kubernetes_sd_configs:
          - role: pod
            namespaces:
              names: [sorte-agora-prod]
        relabel_configs:
          - source_labels: [__meta_kubernetes_pod_label_app]
            action: keep
            regex: sorte-agora-backend
```

### Grafana Dashboards

```bash
# Import dashboards
kubectl apply -f monitoring/grafana-dashboards/
```

### Logging

```yaml
# fluentd-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: fluentd-config
data:
  fluent.conf: |
    <source>
      @type tail
      path /var/log/containers/*.log
      pos_file /var/log/fluentd-containers.log.pos
      tag kubernetes.*
      read_from_head true
      <parse>
        @type json
      </parse>
    </source>
    
    <match **>
      @type elasticsearch
      host elasticsearch.logging
      port 9200
      logstash_format true
      logstash_prefix sorte-agora
    </match>
```

## Backup & Disaster Recovery

### Database Backups

```bash
# Automated daily backups
kubectl apply -f k8s/production/postgres-backup-cronjob.yaml

# Manual backup
kubectl exec -n sorte-agora-prod postgres-0 -- pg_dump \
  -U sorteagora sorte_agora > backup.sql

# Restore
kubectl exec -i -n sorte-agora-prod postgres-0 -- psql \
  -U sorteagora sorte_agora < backup.sql
```

### S3 Backup Strategy

```bash
# Backup to S3
aws s3 sync s3://sorte-agora-uploads /local/backups/uploads

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket sorte-agora-uploads \
  --versioning-configuration Status=Enabled

# Cross-region replication
aws s3api put-bucket-replication \
  --bucket sorte-agora-uploads \
  --replication-configuration file://replication.json
```

## Security Hardening

### Network Policies

```yaml
# network-policy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: sorte-agora-network-policy
spec:
  podSelector: {}
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: ingress-nginx
      ports:
        - protocol: TCP
          port: 3001
  egress:
    - to:
        - namespaceSelector:
            matchLabels:
              name: sorte-agora-prod
      ports:
        - protocol: TCP
          port: 5432
    - to:
        - namespaceSelector:
            matchLabels:
              name: sorte-agora-prod
      ports:
        - protocol: TCP
          port: 6379
```

### Pod Security Policies

```yaml
# pod-security-policy.yaml
apiVersion: policy/v1beta1
kind: PodSecurityPolicy
metadata:
  name: sorte-agora-psp
spec:
  privileged: false
  allowPrivilegeEscalation: false
  requiredDropCapabilities:
    - ALL
  volumes:
    - 'configMap'
    - 'emptyDir'
    - 'projected'
    - 'secret'
    - 'downwardAPI'
    - 'persistentVolumeClaim'
  hostNetwork: false
  hostIPC: false
  hostPID: false
  runAsUser:
    rule: 'MustRunAsNonRoot'
  seLinux:
    rule: 'RunAsAny'
  fsGroup:
    rule: 'MustRunAs'
    ranges:
      - min: 1000
        max: 65535
```

## Performance Optimization

### Database Connection Pooling

```yaml
# PgBouncer deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pgbouncer
spec:
  replicas: 2
  selector:
    matchLabels:
      app: pgbouncer
  template:
    metadata:
      labels:
        app: pgbouncer
    spec:
      containers:
        - name: pgbouncer
          image: pgbouncer/pgbouncer:latest
          env:
            - name: DATABASES_HOST
              value: postgres-service
            - name: DATABASES_PORT
              value: "5432"
            - name: DATABASES_DBNAME
              value: sorte_agora
            - name: DATABASES_USER
              value: sorteagora
            - name: DATABASES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: postgres-secret
                  key: password
          ports:
            - containerPort: 5432
```

### CDN Configuration

```bash
# Cloudflare setup
# 1. Add domain to Cloudflare
# 2. Configure DNS records
# 3. Enable SSL/TLS (Full mode)
# 4. Configure Page Rules
# 5. Enable Cache Everything for static assets
# 6. Configure WAF rules
# 7. Enable Bot Fight Mode
```

## Troubleshooting

### Common Issues

#### Pod Not Starting

```bash
# Check pod status
kubectl describe pod <pod-name> -n sorte-agora-prod

# Check logs
kubectl logs <pod-name> -n sorte-agora-prod

# Check events
kubectl get events -n sorte-agora-prod --sort-by='.lastTimestamp'
```

#### Database Connection Issues

```bash
# Test database connection
kubectl exec -it <pod-name> -n sorte-agora-prod -- psql \
  -h postgres-service -U sorteagora -d sorte_agora

# Check connection pool
kubectl exec -it pgbouncer-0 -n sorte-agora-prod -- psql \
  -h pgbouncer -U pgbouncer -d pgbouncer -c "SHOW POOLS;"
```

#### High Memory Usage

```bash
# Check resource usage
kubectl top pods -n sorte-agora-prod

# Check node resources
kubectl top nodes

# Adjust limits
kubectl patch deployment sorte-agora-backend \
  -n sorte-agora-prod \
  -p '{"spec":{"template":{"spec":{"containers":[{"name":"backend","resources":{"limits":{"memory":"2Gi"}}}]}}}}'
```

## Rollback Procedures

### Quick Rollback

```bash
# Rollback to previous deployment
kubectl rollout undo deployment/sorte-agora-backend \
  -n sorte-agora-prod

# Rollback to specific revision
kubectl rollout undo deployment/sorte-agora-backend \
  -n sorte-agora-prod --to-revision=3

# Check rollback status
kubectl rollout status deployment/sorte-agora-backend \
  -n sorte-agora-prod
```

### Database Rollback

```bash
# List migrations
npx prisma migrate status

# Rollback last migration
npx prisma migrate resolve --rolled-back <migration-name>

# Restore from backup
kubectl exec -i postgres-0 -n sorte-agora-prod -- psql \
  -U sorteagora sorte_agora < backup.sql
```

## Maintenance Windows

### Scheduled Maintenance

```bash
# Scale down deployments
kubectl scale deployment sorte-agora-backend \
  -n sorte-agora-prod --replicas=0

# Perform maintenance
# ...

# Scale up
kubectl scale deployment sorte-agora-backend \
  -n sorte-agora-prod --replicas=3
```

### Zero-Downtime Deployment

```bash
# Use rolling update
kubectl set image deployment/sorte-agora-backend \
  backend=sorte-agora-backend:new-tag \
  -n sorte-agora-prod

# Configure rolling update strategy
kubectl patch deployment sorte-agora-backend \
  -n sorte-agora-prod \
  -p '{"spec":{"strategy":{"rollingUpdate":{"maxSurge":1,"maxUnavailable":0}}}}'
```

## Documentation

### Runbook

- [Incident Response Runbook](./runbooks/incident-response.md)
- [Database Maintenance Runbook](./runbooks/database-maintenance.md)
- [Performance Tuning Runbook](./runbooks/performance-tuning.md)

### Contact Information

- **DevOps Team**: devops@sorteagora.com
- **Security Team**: security@sorteagora.com
- **On-Call**: +55 11 9999-9999
