# 🏪 ComércioIA

Assistente inteligente para pequenos comércios. Gerencie vendas, clientes, estoque e descubra insights automáticos com IA.

## 🚀 Como rodar

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar variáveis de ambiente

Edite o arquivo `.env`:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="troque-por-uma-string-aleatoria-longa"
NEXTAUTH_URL="http://localhost:3000"
ANTHROPIC_API_KEY="sk-ant-..."   # Sua chave da Anthropic
```

> 🔑 Pegue sua chave em: https://console.anthropic.com

### 3. Criar o banco de dados
```bash
npm run db:push
```

### 4. Popular com dados demo (opcional)
```bash
npm run db:seed
```
Login demo: `demo@comercioia.com` / `demo123`

### 5. Rodar em desenvolvimento
```bash
npm run dev
```

Acesse: http://localhost:3000

---

## 📦 Stack

- **Next.js 14** (App Router)
- **Prisma + SQLite** (banco simples, zero configuração)
- **NextAuth.js** (autenticação com JWT)
- **Recharts** (gráficos)
- **Anthropic SDK** (IA via Claude)
- **Tailwind CSS**

## 🌐 Deploy (Vercel)

1. Crie um projeto na [Vercel](https://vercel.com)
2. Adicione as variáveis de ambiente
3. Para produção, troque SQLite por PostgreSQL (Vercel Postgres ou Neon)
4. `git push` — deploy automático

## 📁 Estrutura

```
comercioia/
├── app/
│   ├── api/           # Backend (rotas API)
│   │   ├── auth/      # Login, registro
│   │   ├── sales/     # CRUD de vendas
│   │   ├── products/  # CRUD de produtos
│   │   ├── clients/   # CRUD de clientes
│   │   ├── insights/  # Analytics automático
│   │   └── ai/        # Chat com Claude
│   ├── dashboard/     # Página principal
│   ├── sales/         # Página de vendas
│   ├── products/      # Página de produtos
│   ├── clients/       # Página de clientes
│   ├── insights/      # Página de insights
│   ├── ai/            # Chat com IA
│   ├── login/         # Autenticação
│   └── register/      # Cadastro
├── components/
│   └── layout/        # AppShell + Sidebar
├── lib/
│   ├── auth.ts        # Configuração NextAuth
│   └── prisma.ts      # Cliente Prisma
└── prisma/
    ├── schema.prisma  # Modelos do banco
    └── seed.ts        # Dados demo
```

## 🔮 Próximos passos

- [ ] Migrar SQLite → PostgreSQL para produção
- [ ] Relatórios em PDF exportável
- [ ] Notificações por WhatsApp (estoque baixo)
- [ ] App mobile (React Native / Expo)
- [ ] Multi-idioma
- [ ] Planos e pagamento (Stripe)
