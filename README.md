# Finance App

Uma plataforma moderna e robusta de controle financeiro pessoal, desenvolvida com foco em performance, escalabilidade e experiência do usuário. O projeto evoluiu de uma solução simples de armazenamento local para uma arquitetura profissional baseada em nuvem.

## Evolução e Maturidade

O projeto **Finance App** percorreu uma jornada significativa de amadurecimento técnico:

1.  **Fase 1 (MVP - JSON Local):** Inicialmente, os dados eram armazenados em arquivos JSON locais. Esta fase foi essencial para validar a interface e o fluxo de usuários, mas apresentava limitações de persistência, concorrência e escalabilidade.
2.  **Fase 2 (Migração PostgreSQL + Prisma):** O salto para a maturidade ocorreu com a migração para o **PostgreSQL (Neon DB)** utilizando o ORM **Prisma 7**. Isso permitiu relacionamentos complexos, integridade de dados e suporte a múltiplos usuários.
3.  **Fase 3 (Arquitetura de Serviços):** Introduzimos uma camada de serviços (`Service Pattern`) para isolar a lógica de negócios da infraestrutura, garantindo um código limpo (`Clean Code`) e testável.

## Arquitetura do Sistema

O projeto segue os princípios de **Clean Architecture** e **Separation of Concerns (SoC)**:

- **Frontend (Next.js 16):** Utiliza o novo paradigma de _App Router_, combinando _Server Components_ para SEO/Performance e _Client Components_ para interatividade.
- **Server Actions:** Toda a mutação de dados ocorre via Server Actions, eliminando a necessidade de APIs REST tradicionais e garantindo tipagem end-to-end com TypeScript.
- **Service Layer:** Camada intermediária que orquestra as regras de negócio antes de interagir com o banco de dados.
- **State Management (Zustand):** Gerenciamento de estado global leve e eficiente para sincronização de transações e metas entre diferentes telas.
- **Middleware / Proxy:** Sistema de segurança que intercepta requisições para garantir que o usuário acesse apenas seus próprios dados (_Multi-tenancy_).

## Tecnologias Utilizadas

### Core

- **Framework:** [Next.js 16 (Turbopack)](https://nextjs.org/)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Banco de Dados:** [PostgreSQL (Neon)](https://neon.tech/)
- **ORM:** [Prisma 7](https://www.prisma.io/)

### Bibliotecas de UI & Estilização

- **CSS:** [Tailwind CSS](https://tailwindcss.com/)
- **Componentes:** [Radix UI](https://www.radix-ui.com/) & [Shadcn/UI](https://ui.shadcn.com/)
- **Ícones:** [Lucide React](https://lucide.dev/)
- **Gráficos:** [Recharts](https://recharts.org/)
- **Animações:** [Framer Motion](https://www.framer.com/motion/) & CSS Transitions

### Utilitários

- **Gerenciamento de Estado:** [Zustand](https://zustand-demo.pmnd.rs/)
- **Manipulação de Datas:** [Date-fns](https://date-fns.org/)
- **Notificações:** [Sonner](https://sonner.emilkowal.ski/)
- **Criptografia:** [Bcrypt](https://www.npmjs.com/package/bcrypt)

## Como Executar o Projeto

1.  **Clone o repositório:**

    ```bash
    git clone https://github.com/seu-usuario/finance-app.git
    ```

2.  **Instale as dependências:**

    ```bash
    npm install
    ```

3.  **Configure o ambiente:**
    Crie um arquivo `.env.local` na raiz com sua URL do banco de dados:

    ```env
    DATABASE_URL="postgresql://user:pass@host/dbname?sslmode=require"
    JWT_SECRET="sua_chave_secreta"
    ```

4.  **Sincronize o banco de dados:**

    ```bash
    npx prisma db push
    npx prisma generate
    ```

5.  **Inicie o servidor de desenvolvimento:**

    ```bash
    npm run dev
    ```

6.  **Popule o banco (Opcional):**
    ```bash
    node prisma/seed.cjs
    ```

## Segurança e Boas Práticas

- **Hash de Senhas:** Todas as senhas são criptografadas com `bcrypt` antes de serem salvas.
- **Isolamento de Dados:** Cada usuário possui seu próprio `userId`, garantindo que um usuário não possa ver ou editar dados de outro através do Middleware de Proxy.
- **Clean Code:** Código modularizado, com funções focadas e responsabilidade única.
