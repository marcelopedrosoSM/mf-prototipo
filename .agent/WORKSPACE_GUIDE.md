# Guia de Workspace - MF-Prototipo

## 🎯 Sobre o Projeto

**MF-Prototipo** é um **protótipo frontend** focado em prototipagem rápida e demonstração de conceitos. 

### Características Principais:
- ✨ **Protótipo**: Não é um sistema de produção, mas sim uma ferramenta de prototipagem
- 🎭 **Dados Mock**: Utiliza **MSW (Mock Service Worker)** e **Faker.js** para simular dados
- 🚀 **Desenvolvimento Rápido**: Stack otimizada para iteração rápida e testes de UI/UX
- 📦 **Sem Backend Real**: Todas as APIs são mockadas localmente

### Stack Tecnológica

#### Core & Build
- **Vue.js 3** (Composition API) - Framework principal
- **Vite** - Build tool e dev server
- **TypeScript** - Tipagem estática
- **Pinia** - Gerenciamento de estado
- **Vue Router** - Roteamento

#### Interface & Estilo
- **Tailwind CSS** - Framework CSS utility-first
- **Radix Vue** - Componentes primitivos acessíveis
- **Shadcn-vue** - Sistema de componentes
- **Lucide Vue** - Biblioteca de ícones
- **Reka UI** - Componentes adicionais
- **Vaul Vue** - Drawer components

#### Simulação de Dados (IMPORTANTE!)
- **Mock Service Worker (MSW)** - Interceptação de requisições HTTP
- **Faker.js (@faker-js/faker)** - Geração de dados realistas falsos
- **Axios** - Cliente HTTP (usado com MSW)

#### Editores & Visualização
- **TipTap** - Editor de texto rico
- **Vue Flow** - Editor de fluxos/diagramas
- **Unovis** - Visualização de dados

#### Validação & Formulários
- **Vee-Validate** - Validação de formulários
- **Zod** - Schema validation

#### Qualidade de Código
- **ESLint** - Linter
- **Prettier** - Formatter
- **TypeScript** - Type checking

### Path Aliases
```
@/ → src/
@components/ → src/components/
@stores/ → src/stores/
@services/ → src/services/
@utils/ → src/utils/
@types/ → src/types/
@mocks/ → src/mocks/
```

## 📋 Estrutura de Workspaces

Este projeto utiliza **3 workspaces** com propósitos distintos:

### 1. **MF-prototipo** (Workspace Principal)
- **Caminho**: `c:\Users\engma\OneDrive\Documentos\GitHubSM\MF-prototipo`
- **Propósito**: Desenvolvimento ativo do projeto
- **Regra**: ✅ **TODO o código deve ser modificado APENAS neste workspace**

### 2. **myflows-base** (Código Base de Referência)
- **Caminho**: `c:\Users\engma\OneDrive\Documentos\GitHubSM\myflows-base`
- **Propósito**: Código de referência para consulta
- **Regra**: 👀 **APENAS para leitura e consulta - NÃO modificar**

### 3. **painel-base** (Código Base de Referência)
- **Caminho**: `c:\Users\engma\OneDrive\Documentos\GitHubSM\painel-base`
- **Propósito**: Código de referência para consulta
- **Regra**: 👀 **APENAS para leitura e consulta - NÃO modificar**

## 🎯 Regras para Agentes

### ✅ O QUE FAZER:
- Desenvolver e modificar código **APENAS** em `MF-prototipo`
- Consultar `myflows-base` e `painel-base` para exemplos e referências
- Usar os repositórios base como fonte de inspiração e padrões

### ❌ O QUE NÃO FAZER:
- **NUNCA** modificar código em `myflows-base` ou `painel-base`
- **NUNCA** criar novos arquivos nos repositórios base
- **NUNCA** fazer commits nos repositórios base

## 📝 Workflow Recomendado

1. **Consultar** código base (`myflows-base` ou `painel-base`) para entender padrões
2. **Implementar** no `MF-prototipo` adaptando conforme necessário
3. **Testar** e validar no workspace principal

## 🎭 Trabalhando com Dados Mock

### Localização dos Mocks
- **Handlers MSW**: `src/mocks/handlers.ts`
- **Dados Faker**: `src/mocks/data/` (se existir)
- **Configuração MSW**: `src/mocks/browser.ts`

### Boas Práticas
1. **Use Faker.js** para gerar dados realistas:
   ```typescript
   import { faker } from '@faker-js/faker'
   
   const user = {
     id: faker.string.uuid(),
     name: faker.person.fullName(),
     email: faker.internet.email()
   }
   ```

2. **Configure handlers MSW** para simular APIs:
   ```typescript
   import { http, HttpResponse } from 'msw'
   
   export const handlers = [
     http.get('/api/users', () => {
       return HttpResponse.json(users)
     })
   ]
   ```

3. **Mantenha dados consistentes** entre diferentes handlers
4. **Simule delays realistas** para testar estados de loading
5. **Teste cenários de erro** criando handlers específicos

### Desabilitar MSW
Para desabilitar o MSW temporariamente:
```bash
VITE_USE_MSW=false npm run dev
```

## 🔧 Manutenção dos Repositórios Base

Os repositórios `myflows-base` e `painel-base` devem permanecer limpos e sem modificações.
Se houver alterações acidentais, use:

```bash
# Descartar alterações
git reset --hard HEAD

# Remover arquivos não rastreados
git clean -fd
```

---

## 💡 Padrões de Componentes

### 🔌 Switch (reka-ui)
O `SwitchRoot` do `reka-ui` usa `modelValue` e `update:modelValue`. Para garantir a sincronização visual correta em componentes controlados, utilize uma **ref local com watchers bidirecionais**.

#### Exemplo de Uso Correto:
```vue
<script setup lang="ts">
import { ref, watch } from 'vue'
import { Switch } from '@/components/ui/switch'

const props = defineProps<{ enabled?: boolean }>()
const emit = defineEmits(['update:enabled'])

// 1. Criar ref LOCAL
const localEnabled = ref(props.enabled ?? false)

// 2. Sincronizar: prop -> ref local
watch(() => props.enabled, (val) => {
  if (val !== undefined) localEnabled.value = val
}, { immediate: true })

// 3. Sincronizar: ref local -> emit para pai
watch(localEnabled, (val) => {
  emit('update:enabled', val)
})
</script>

<template>
  <Switch
    :checked="localEnabled"
    @update:checked="(val) => localEnabled = val"
    :model-value="localEnabled"
    @update:model-value="(val) => localEnabled = val"
  />
</template>
```

---

**Última atualização**: 2025-12-18
