# MF Protótipo

Stack de prototipagem frontend com Vue 3, TypeScript, Tailwind CSS, Shadcn-vue, MSW e Faker.js.

## Stack

### Core & Build
- **Vue.js 3** (Composition API)
- **Vite** (Build tool)
- **TypeScript**
- **Pinia** (Gerenciamento de estado)
- **Vue Router**

### Interface & Estilo
- **Tailwind CSS**
- **Radix Vue** (Componentes base)
- **Shadcn-vue** (Sistema de componentes)
- **Lucide Vue** (Ícones)

### Simulação de Dados
- **Mock Service Worker (MSW)** (Mocking de API)
- **Faker.js** (Geração de dados falsos)
- **Axios** (Cliente HTTP)

### Qualidade de Código
- **ESLint** (Linter)
- **Prettier** (Formatter)

## Instalação

```bash
# Instalar dependências
npm install

# Ou com yarn
yarn install

# Ou com pnpm
pnpm install
```

## Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview

# Linting
npm run lint

# Formatação
npm run format

# Verificação de tipos
npm run type-check
```

## Estrutura do Projeto

```
src/
├── assets/          # Recursos estáticos (CSS, imagens)
├── components/      # Componentes Vue reutilizáveis
│   └── ui/         # Componentes Shadcn-vue
├── stores/         # Stores Pinia
├── mocks/          # Handlers MSW + dados Faker
├── services/       # Serviços HTTP (Axios)
├── router/         # Vue Router
├── views/          # Páginas/Vistas
├── types/          # Tipos TypeScript
├── utils/          # Funções utilitárias
└── lib/            # Utilitários (cn, etc)
```

## Path Aliases

O projeto usa aliases para facilitar imports:

- `@/` → `src/`
- `@components/` → `src/components/`
- `@stores/` → `src/stores/`
- `@services/` → `src/services/`
- `@utils/` → `src/utils/`
- `@types/` → `src/types/`
- `@mocks/` → `src/mocks/`

## MSW (Mock Service Worker)

O MSW está configurado para rodar automaticamente em desenvolvimento. Os handlers estão em `src/mocks/handlers.ts`.

Para desabilitar o MSW, defina a variável de ambiente:
```
VITE_USE_MSW=false
```

## Componentes Shadcn-vue

Para adicionar novos componentes Shadcn-vue, use o CLI:

```bash
npx shadcn-vue@latest add [component-name]
```

## Desenvolvimento

1. Clone o repositório
2. Instale as dependências: `npm install`
3. Inicie o servidor de desenvolvimento: `npm run dev`
4. Acesse `http://localhost:5173`

## Licença

MIT

