# Documentação: Flow Builder

O Flow Builder é a ferramenta visual para construção de fluxos de conversa e automação de processos.

**Arquivos de Referência:**
*   Tipos: `src/types/flow-builder.ts`
*   Execução Lógica: `src/utils/flowExecution.ts`
*   Store: `src/stores/flows.ts`

## 1. Tipos de Blocos (`BlockType`)

Os blocos são as unidades fundamentais de um fluxo. Definidos em `src/types/flow-builder.ts`.

### Blocos de Interação
*   `message`: Envia uma mensagem de texto simples.
*   `question`: Envia uma pergunta e aguarda resposta do usuário (pode salvar em variável).
*   `switch` / `decision`: Bloco de decisão lógica (IF/ELSE).

### Blocos de Ação
*   `action`: Executa uma ação de sistema (ver `ActionType`).
*   `api` / `integration`: Faz uma chamada HTTP externa (Webhook).

### Blocos de Controle
*   `start`: Ponto de início do fluxo.
*   `end`: Ponto de término.
*   `wait`: Pausa a execução por um tempo determinado.
*   `chat_flow`: Redireciona para outro fluxo existente (sub-fluxo).

### Blocos de Atividades (Modo Execução)
Geram atividades manuais para os agentes:
*   `email`: Instrução para enviar e-mail.
*   `call`: Instrução para realizar ligação.
*   `task`: Tarefa genérica.

## 2. Condições e Variáveis

### Avaliação de Decisões (`evaluateSwitch`) -> `src/utils/flowExecution.ts`
A função `evaluateSwitch` é o "cérebro" das decisões condicionais. Ela suporta:

1.  **Comparação Simples:** `vars.idade > 18`
2.  **Operadores Suportados:**
    *   Igualdade: `===`, `!==`, `==`, `!=`
    *   Numéricos: `>`, `<`, `>=`, `<=`
    *   String: `contains`, `starts_with`, `ends_with`
    *   Existência: `empty`, `not_empty`

3.  **Variáveis de Contexto:**
    As variáveis são acessadas via `vars.nome_da_variavel`. Exemplo: `vars.cliente_nome`.

## 3. Ações de Sistema (`ActionType`)

Definidas em `ACTION_TYPES`:
*   `add_tag`: Adiciona uma etiqueta ao contato.
*   `assign_agent`: Atribui a conversa a um agente específico.
*   `assign_team`: Atribui a conversa a um time (fila).
*   `finish_conversation`: Encerra a conversa atual.

## 4. Estrutura de Salvamento (`SavedFlow`)

Os fluxos são persistidos com a seguinte estrutura (Store `useFlowsStore`):
```typescript
interface SavedFlow {
    id: string;
    nome: string;
    nodes: Node[]; // Elementos visuais (Vue Flow)
    edges: Edge[]; // Conexões (Vue Flow)
    isActive: boolean;
    // ...
}
```
A store inclui um mecanismo de migração automática (`migrateOldFlows`) para importar dados de versões legadas armazenados no LocalStorage.
