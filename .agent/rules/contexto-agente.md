---
trigger: always_on
description: Guia de código e regras de negócio
---

# Contexto & Guia de Desenvolvimento - MF-Prototipo

**Última atualização**: 2025-12-26

## 🎯 Sobre o Projeto

### O que é o MyFlows?
O **MyFlows** é uma plataforma SaaS de **Gestão de Fluxos**. Ele organiza a execução de **Fluxos de Atividades** (vendas, atendimento) e **Fluxos de Atendimento por IA**, garantindo consistência, produtividade e automação em todas as interações (Humanas ou Artificiais).

### O que é este Repositório?
Este é o ambiente de **validação de UI/UX**. Ele simula o sistema real sem backend, focando exclusivamente na experiência do usuário, interações visuais e validação de regras de negócio.

---

## 📐 Fundamentos (Constituição do Projeto)

### 1. Princípios de Engenharia (Código)
*   **K.I.S.S. (Keep It Simple, Stupid)**: A solução mais simples que resolve o problema é a melhor. Evite over-engineering.
*   **Clean Code & Intencionalidade**:
    *   Variáveis: `isModalOpen` (sim/não?), `userCount` (número?). Nomes devem revelar o propósito.
    *   Comentários: Apenas para explicar o *porquê* (decisões de negócio complexas), nunca o *o que*.
*   **D.R.Y. (Don't Repeat Yourself)**:
    *   Lógica repetida -> Extrair para **Composable** (`src/composables`).
    *   UI repetida -> Extrair para **Componente** (`src/components`).
*   **Composition API First**: Sempre utilize `<script setup lang="ts">` (Vue 3).
*   **S.S.O.T. (Single Source of Truth)**:
    *   Defina dados e configurações em apenas um lugar. Ex: Cores no `index.css`, Estado no `Pinia` (evite duplicar estado em props/refs locais desnecessariamente).

### 2. Princípios de Produto (Design & UX)
*   **"Não Me Faça Pensar" (Steve Krug)**:
    *   A interface deve ser óbvia. Ações principais (`Start Flow`) devem ter destaque e ícones claros.
    *   Se precisa de explicação, reduza a complexidade primeiro. Se ainda precisar, use **Ajuda Contextual**.
*   **Design Atômico**:
    *   Construa interfaces complexas (Organismos) compondo pequenos componentes reutilizáveis (Átomos/Moléculas).
    *   Priorize componentes do **Shadcn** (`@components/ui`) antes de criar novos.
*   **Padronização (System-First)**:
    *   Use estritamente os **Design Tokens** do Tailwind.
    *   **Proibido Cores Hardcoded**: Defina cores **apenas** no `index.css` (CSS Variables) e mapeie no Tailwind. Isso garante uma **Única Fonte de Verdade (SSOT)**. Nunca use hexadecimais soltos em componentes.

---

## 🏗️ Padrões de Arquitetura

### 1. Estrutura de Pastas
*   **`@/views` (Paginas)**: "Burras". Apenas organizam o layout e chamam Stores.
*   **`@/components/ui` (Base)**: Componentes visuais genéricos (Button, Card). Sem lógica de negócio.
*   **`@/components/[feature]` (Smart)**: Componentes com lógica de negócio específica (ex: `ExecutionActivityCard`).
*   **`@/mocks` (Dados)**: O coração do protótipo. Use `MSW` e `Faker.js` para simular um backend robusto.

### 2. Tratamento de Dados (Mock-First)
Como este é um protótipo **sem backend**, a camada de dados é simulada:
*   Use **Faker.js** para gerar dados realistas sempre que possível.
*   Use **MSW (Mock Service Worker)** para interceptar chamadas HTTP e simular delays/erros de rede.
*   A aplicação deve "acreditar" que está falando com uma API real.

---

## 🎨 Guia de Estilos (UI Patterns)

### Cores de Status
Padronização visual para Badges e Indicadores:

| Status | Estilo Tailwind |
| :--- | :--- |
| **Pendente** | `bg-blue-100 text-blue-600` |
| **Atrasado** | `bg-orange-100 text-orange-600` |
| **Concluído** | `bg-green-100 text-green-600` |
| **Ignorado** | `bg-slate-100 text-slate-600` |

### Ajuda e Feedback
*   **Explicabilidade Obrigatória**: Toda nova funcionalidade complexa, métrica ou cálculo **deve** ter uma explicação acessível. O usuário nunca deve ter dúvida de "como esse número foi calculado?".
*   **Padrão de UI**: Use ícone `HelpCircle` (?) com clique para abrir **Dialog** explicativo. (Evite Tooltips básicos para explanações de regras de negócio).
*   **Empty States**: Nunca deixe a tela em branco. Mostre ícone + mensagem + botão de ação.

---
## 🌎 Formatação & Localização (PT-BR)

### 1. Moeda (R$)
*   Use **Intl.NumberFormat** nativo do navegador.
*   **Padrão**: `pt-BR`, `BRL`.
*   **Exemplo**:
    ```typescript
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(1234.56)
    // Resultado: "R$ 1.234,56"
    ```

### 2. Datas e Horários
*   **Visualização**: Sempre `DD/MM/AAAA` (ex: 25/12/2024).
*   **Código**: Use `src/utils/date.ts` para conversões padrão.
*   **Exemplo**:
    ```typescript
    import { formatDate } from '@/utils/date';
    formatDate('2024-12-25') // "25/12/2024"
    ```

### 3. Números Decimais
*   **Separador Decimal**: Vírgula (`,`) - NUNCA ponto (`.`).
*   **Separador de Milhar**: Ponto (`.`).
*   **Exemplo**: `1.234,56` (um mil duzentos e trinta e quatro vírgula cinquenta e seis).
*   **Código**:
    ```typescript
    new Intl.NumberFormat('pt-BR').format(1234.56)
    // Resultado: "1.234,56"
    ```

---

## 🧠 Regras de Negócio e Mapa de Rotas

Esta seção mapeia todos os módulos do sistema e suas respectivas regras.

### 1. Core & Dashboard
*   `/painel`: Visão geral e métricas.
*   `/conversas`: Chat unificado.

### 2. Gestão de Fluxos
*   `/fluxos`: Gestão de fluxos.
*   `/configuracoes/fluxos/atendimento`: Listagem completa de fluxos de atendimento (IA/Humano).
*   `/configuracoes/fluxos/atividades`: Listagem de fluxos de cadência (tarefas).
*   `/configuracoes/fluxos/:id`: Editor de Fluxo de Conversa (Builder).
*   `/configuracoes/fluxos-atividades/:id`: Editor de Fluxo de Tarefas (Builder).

### 3. Execução (`/execucao`)
*   **Módulo**: Modo focado na execução de tarefas do usuário.
*   **Regra de Progresso (Escopo Válido)**:
    *   `Ignoradas` são removidas do total.
    *   Fórmula: `Progresso = Concluídas / (Total - Ignoradas)`.

### 4. CRM & Contatos
*   `/contatos`: Gestão de base de contatos.

### 5. Configurações (`/configuracoes`)
*   `/configuracoes/preferencias`: Preferências do usuário (Home page, Tema, Notificações).
*   `/configuracoes/automacoes`:
    *   **Regra de Agrupamento**: Exibir agrupadas por Inbox/Canal.
    *   **Regra de Unicidade**: 1 automação ativa por gatilho/canal.
*   `/configuracoes/agentes`: Gestão de agentes.
*   `/configuracoes/times`: Gestão de equipes.
*   `/configuracoes/caixas-entrada`: Conexão de canais (WhatsApp, Email).
*   `/configuracoes/mensagens-rapidas`: Snippets de respostas.
*   `/configuracoes/ausencias`: Configuração de períodos de ausência (Feriados, Inatividades).
*   `/configuracoes/tokens-api`: Chaves de acesso.


