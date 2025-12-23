# Relatório de Gaps de Integração

Análise técnica da conectividade entre módulos (Automação, Fluxo, Execução) e Entidades de Negócio (Contato, Agente, Time, Caixa).

## 1. Desconexão da Lógica de Negócio (Atribuição)

O sistema possui as entidades definidas (`Contact`, `Inbox`, `Time`, `AssignedUser`), mas o motor de execução de fluxos (**Simulador**) não interage com elas.

### Problema Identificado
No arquivo `useFlowSimulator.ts`, o bloco do tipo `action` suporta apenas `finish_conversation`.

**Código Atual:**
```typescript
case 'action':
    const actionTypeStr = (data.actionType as string) || '';
    if (actionTypeStr === 'finish_conversation') {
        // ... encerra conversa
    }
    // Outras ações (assign_agent, assign_team, add_tag) são IGNORADAS.
    break;
```

**Consequência:**
Se você configurar um fluxo para "Atribuir ao Time de Vendas" ou "Atribuir ao Agente João", **nada acontecerá** durante a execução. A conversa continuará sem dono ou com o dono anterior.

## 2. Desconexão do Modo Execução (Atividades)

O Flow Builder permite adicionar blocos de **E-mail**, **Ligação** e **Tarefa**, mas o motor de execução não sabe processá-los.

### Problema Identificado
1.  O `switch` principal em `useFlowSimulator.ts` não possui `case` para: `email`, `call`, `task`.
2.  Esses blocos cairão no `default`, gerando um erro: `⚠️ Tipo de bloco desconhecido`.
3.  A função `generateActivitiesFromFlow` (na store `activities.ts`) existe mas **nunca é chamada**.

**Consequência:**
O fluxo será interrompido com erro ao encontrar uma tarefa, e nenhuma atividade aparecerá na lista de "Modo Execução" dos agentes.

## 3. Recomendação de Correção

Para conectar "tudo" conforme solicitado, é necessário:

1.  **Atualizar `useFlowSimulator.ts`:**
    *   Implementar `case` para `email`, `call`, `task` que chame `activityStore.generateActivitiesFromFlow`.
    *   Expandir o `case 'action'` para processar `assign_agent` e `assign_team`, atualizando a `ChatSession` (mock ou real).

2.  **Integrar Contexto de Sessão:**
    *   O simulador precisa receber o objeto `ChatSession` completo para poder modificar o `assignedUser` quando uma ação de atribuição ocorrer.
