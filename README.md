# CRM SaaS - Sistema de Gestão de Relacionamento com Clientes

Sistema moderno de CRM desenvolvido com Next.js 14, Prisma ORM, Tailwind CSS e TypeScript.

## Requisitos

- Node.js 18 ou superior
- PostgreSQL 12 ou superior
- NPM ou Yarn

## Configuração do Ambiente

1. Clone o repositório:

```bash
git clone <repository-url>
cd crm-saas
```

2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente:

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/crm_saas?schema=public"
```

Substitua `user`, `password` e outros valores conforme sua configuração local do PostgreSQL.

4. Execute as migrações do banco de dados:

```bash
npm run db:push
```

5. Popule o banco de dados com dados iniciais:

```bash
npm run db:seed
```

## Executando o Projeto

1. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

2. Acesse o sistema:

Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## Funcionalidades Principais

- Gestão de Empresas
  - Cadastro e edição de empresas
  - Visualização em lista com busca e filtros
  - Perfil detalhado com feed de interações

- Gestão de Contatos
  - Cadastro de contatos vinculados a empresas
  - Informações detalhadas de cada contato

- Pipeline de Vendas
  - Kanban board interativo
  - Múltiplos estágios personalizáveis
  - Drag and drop de negócios

- Negócios
  - Criação e acompanhamento de oportunidades
  - Valores e status de cada negócio
  - Histórico de interações

## Estrutura do Projeto

```
src/
├── app/            # Rotas e páginas
├── components/     # Componentes React
├── lib/           # Utilitários e configurações
└── styles/        # Estilos globais
```

## Tecnologias Utilizadas

- Next.js 14
- Prisma ORM
- Tailwind CSS
- TypeScript
- shadcn/ui
- React Hook Form
- Zod

## Desenvolvimento

- Para adicionar novas migrações:
```bash
npx prisma migrate dev --name <nome-da-migracao>
```

- Para atualizar o cliente Prisma:
```bash
npx prisma generate
```

## Licença

Este projeto está licenciado sob a licença MIT.