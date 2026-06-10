# Guia de Setup para Desenvolvedores - SORTE AGORA
**Versão:** 1.0.0
**Data:** 1 de Junho de 2026

---

## Pré-requisitos

### Software Necessário
- **Node.js:** 20.x ou superior
- **npm:** 9.x ou superior
- **Docker:** 24.x ou superior
- **Docker Compose:** 2.x ou superior
- **Git:** 2.x ou superior
- **VS Code** (recomendado) ou outro editor

### VS Code Extensions Recomendadas
- ESLint
- Prettier
- Prisma
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin (Volar)
- GitLens
- Docker

---

## Clonar o Repositório

```bash
git clone <repository-url>
cd windsurf-project
```

---

## Configuração do Backend

### 1. Instalar Dependências
```bash
cd backend
npm install
```

### 2. Configurar Variáveis de Ambiente
```bash
cp .env.example .env
```

Editar `.env` com suas configurações:
```bash
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://sorteagora:sorteagora123@localhost:5432/sorte_agora?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-super-secret-jwt-key"
# ... outras variáveis
```

### 3. Iniciar Banco de Dados e Redis
```bash
# Usando Docker Compose
docker-compose up -d postgres redis
```

### 4. Executar Migrations
```bash
npx prisma migrate dev
```

### 5. Gerar Prisma Client
```bash
npx prisma generate
```

### 6. (Opcional) Seed do Banco de Dados
```bash
npx prisma db seed
```

### 7. Iniciar Servidor de Desenvolvimento
```bash
npm run start:dev
```

O backend estará rodando em `http://localhost:3001`

### 8. Acessar Swagger Docs
Abra `http://localhost:3001/api/docs` no navegador

---

## Configuração do Frontend

### 1. Instalar Dependências
```bash
cd frontend
npm install
```

### 2. Configurar Variáveis de Ambiente
```bash
cp .env.local.example .env.local
```

Editar `.env.local`:
```bash
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Iniciar Servidor de Desenvolvimento
```bash
npm run dev
```

O frontend estará rodando em `http://localhost:3000`

---

## Workflow de Desenvolvimento

### Branches
- `main` - Branch de produção
- `develop` - Branch de desenvolvimento
- `feature/*` - Branches de features
- `bugfix/*` - Branches de correções
- `hotfix/*` - Branches de hotfixes críticos

### Criar Nova Feature
```bash
git checkout develop
git pull origin develop
git checkout -b feature/nome-da-feature

# Fazer alterações
git add .
git commit -m "feat: descrição da feature"
git push origin feature/nome-da-feature

# Criar Pull Request
```

### Commit Messages
Seguir [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: adicionar nova funcionalidade
fix: corrigir bug
docs: atualizar documentação
style: formatar código
refactor: refatorar código
test: adicionar testes
chore: atualizar dependências
```

---

## Comandos Úteis

### Backend
```bash
# Desenvolvimento
npm run start:dev          # Inicia com watch
npm run start:debug        # Inicia com debug
npm run start:prod         # Inicia modo produção

# Build
npm run build              # Compila TypeScript

# Testes
npm run test               # Executa testes
npm run test:watch         # Executa testes com watch
npm run test:cov           # Executa testes com coverage
npm run test:e2e           # Executa testes E2E

# Lint e Formatação
npm run lint               # Executa ESLint
npm run format             # Formata com Prettier

# Prisma
npm run prisma:generate    # Gera Prisma Client
npm run prisma:migrate     # Executa migrations
npm run prisma:studio      # Abre Prisma Studio
npm run prisma:seed        # Executa seed

# Segurança
npm run security:audit     # Verifica vulnerabilidades
npm run security:outdated  # Verifica dependências desatualizadas
```

### Frontend
```bash
# Desenvolvimento
npm run dev                # Inicia Next.js dev server
npm run build              # Build para produção
npm run start              # Inicia produção

# Lint e Type Check
npm run lint               # Executa ESLint
npm run type-check         # Verifica tipos TypeScript

# Análise
npm run analyze            # Analisa bundle

# Testes E2E
npm run test:e2e           # Executa Playwright
npm run test:e2e:ui        # Executa com UI
npm run test:e2e:headed    # Executa com navegador visível

# Segurança
npm run security:audit     # Verifica vulnerabilidades
npm run security:outdated  # Verifica dependências desatualizadas
```

### Docker
```bash
# Iniciar todos os serviços
docker-compose up -d

# Parar todos os serviços
docker-compose down

# Verificar logs
docker-compose logs -f

# Reiniciar serviço específico
docker-compose restart backend

# Executar comando em container
docker-compose exec backend bash

# Verificar status
docker-compose ps
```

---

## Estrutura do Projeto

```
windsurf-project/
├── backend/
│   ├── src/
│   │   ├── common/          # Código compartilhado
│   │   │   ├── decorators/   # Decoradores customizados
│   │   │   ├── filters/      # Filtros de exceção
│   │   │   ├── guards/       # Guards de autenticação
│   │   │   ├── interceptors/ # Interceptors
│   │   │   ├── modules/      # Módulos comuns
│   │   │   ├── pipes/        # Pipes customizados
│   │   │   └── services/     # Serviços compartilhados
│   │   ├── database/        # Configuração de banco
│   │   ├── modules/         # Módulos de negócio
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── financial/
│   │   │   ├── casino/
│   │   │   ├── sports/
│   │   │   ├── vip/
│   │   │   ├── affiliates/
│   │   │   ├── admin/
│   │   │   └── audit/
│   │   ├── app.module.ts    # Módulo raiz
│   │   └── main.ts          # Bootstrap
│   ├── prisma/
│   │   └── schema.prisma    # Schema do banco
│   ├── test/                # Testes
│   ├── Dockerfile
│   ├── package.json
│   └── .env
├── frontend/
│   ├── app/                 # App Router
│   │   ├── (auth)/          # Grupo de rotas auth
│   │   ├── dashboard/
│   │   ├── casino/
│   │   ├── sports/
│   │   ├── vip/
│   │   └── profile/
│   ├── components/          # Componentes React
│   │   └── ui/              # Componentes shadcn/ui
│   ├── lib/                 # Utilitários
│   │   ├── api/             # Clientes API
│   │   ├── hooks/           # Hooks customizados
│   │   ├── stores/          # Zustand stores
│   │   └── utils.ts         # Utilitários
│   ├── e2e/                 # Testes E2E
│   ├── public/              # Arquivos estáticos
│   ├── Dockerfile
│   ├── next.config.js
│   ├── package.json
│   └── .env.local
├── docs/                    # Documentação
├── scripts/                 # Scripts de deployment
├── .github/workflows/      # GitHub Actions
├── docker-compose.yml
└── README.md
```

---

## Debugging

### Backend
```bash
# Iniciar com debug
npm run start:debug

# Usar VS Code launch configuration
# F5 para iniciar debug
```

### Frontend
```bash
# Next.js já suporta debug nativo
# Use VS Code com extensão de debug
```

### Logs
```bash
# Backend logs
docker-compose logs -f backend

# Frontend logs
docker-compose logs -f frontend

# Todos os logs
docker-compose logs -f
```

---

## Testes

### Executar Todos os Testes
```bash
# Backend
cd backend
npm run test

# Frontend
cd frontend
npm run test:e2e
```

### Testes Específicos
```bash
# Teste específico
npm run test -- auth.service.spec.ts

# Teste com watch
npm run test:watch

# Teste com coverage
npm run test:cov
```

---

## Troubleshooting

### Erro: "Cannot find module"
```bash
# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

### Erro: "Prisma Client not generated"
```bash
npx prisma generate
```

### Erro: "Database connection failed"
```bash
# Verificar se PostgreSQL está rodando
docker-compose ps postgres

# Verificar logs
docker-compose logs postgres

# Reiniciar banco
docker-compose restart postgres
```

### Erro: "Port already in use"
```bash
# Verificar qual processo está usando a porta
lsof -i :3001
lsof -i :3000

# Matar processo
kill -9 <PID>
```

### Erro: "TypeScript errors"
```bash
# Verificar tipos
npm run type-check

# Limpar cache
rm -rf .next
rm -rf dist
```

---

## Boas Práticas

### Código
- Seguir convenções de código do projeto
- Usar TypeScript estrito
- Adicionar JSDoc para funções complexas
- Manter funções pequenas e focadas
- Usar nomes descritivos

### Commits
- Commits pequenos e frequentes
- Mensagens de commit claras
- Usar conventional commits
- Revisar diffs antes de commitar

### Branches
- Criar branch para cada feature
- Manter develop atualizado
- Fazer pull requests
- Revisar código antes de merge

### Testes
- Escrever testes para novas features
- Manter coverage alto
- Testar edge cases
- Usar testes E2E para fluxos críticos

---

## Recursos

### Documentação
- [NestJS Docs](https://docs.nestjs.com)
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [React Query Docs](https://tanstack.com/query/latest)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

### Ferramentas
- [Prisma Studio](http://localhost:5555) - Visualizador de banco
- [Swagger UI](http://localhost:3001/api/docs) - Documentação API
- [Jaeger UI](http://localhost:16686) - Tracing visual
- [Grafana](http://localhost:3000) - Dashboards de métricas

---

## Suporte

Para dúvidas ou problemas:
- Abrir issue no GitHub
- Contatar time de desenvolvimento
- Consultar documentação
- Verificar troubleshooting

---

## Checklist de Setup

- [ ] Node.js 20.x instalado
- [ ] Docker e Docker Compose instalados
- [ ] Repositório clonado
- [ ] Backend configurado
- [ ] Frontend configurado
- [ ] Banco de dados iniciado
- [ ] Migrations executadas
- [ ] Dependências instaladas
- [ ] Servidor backend rodando
- [ ] Servidor frontend rodando
- [ ] Swagger docs acessível
- [ ] Testes passando
- [ ] Lint passando
- [ ] Type check passando

Pronto para desenvolvimento! 🚀
