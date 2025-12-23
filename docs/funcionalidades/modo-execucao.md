# Documentação: Modo Execução

O Modo Execução é a interface operacional onde os agentes interagem com tarefas geradas pelos fluxos. Ele transforma o atendimento em um processo estruturado de atividades.

**Arquivos de Referência:**
*   Frontend: `src/views/ExecutionModeView.vue`
*   Tipos: `src/types/execution.ts` / `src/types/activity.ts`
*   Execução Lógica: `src/utils/flowExecution.ts` (integração)

## 1. Conceito de Atividade

Uma **Atividade** é uma unidade de trabalho gerada por um bloco de fluxo (como `task`, `call`, `email`). Diferente de uma mensagem simples, uma atividade requer uma ação explícita de conclusão por parte do agente.

### Ciclo de Vida (`ActivityStatus`)
1.  **`pending`**: Atividade criada e aguardando execução.
2.  **`in_progress`**: Agente iniciou a atividade (ex: clicou em "Ligar").
3.  **`completed`**: Agente marcou como concluída ("Ganho", "Feito").
4.  **`skipped`**: Agente pulou a atividade.
5.  **`failed`**: Houve erro na execução automática ou falha reportada.

## 2. Interface (View)

A `ExecutionModeView.vue` oferece duas visualizações principais dos dados:

### Lista (Timeline)
Organiza as atividades cronologicamente, agrupadas por estado e data:
*   **Atrasadas:** Vencidas (DueDate < Hoje).
*   **Pendentes:** Para fazer hoje ou futuro.
*   **Executadas:** Histórico de conclusão.

### Kanban
Organiza as atividades em colunas de status, permitindo Drag-and-Drop:
*   Pendentes
*   Em Andamento
*   Concluídas

## 3. Ações do Operador

No painel de detalhes (`BottomSheet`), o operador pode:
*   **Executar:** Concluir a atividade e avançar no fluxo.
*   **Pular:** Ignorar a atividade atual e avançar para a próxima.
*   **Reagendar:** Alterar a `dueDate` da atividade.
*   **Decisão (Resultados):** Para atividades com condição (ex: "O cliente atendeu?"), o operador escolhe o resultado ("Sim/Não"), que direciona o fluxo para o caminho correspondente (`handleDecisionSelect`).

## 4. Integração com Fluxos

Quando uma atividade é concluída (`handleExecuteActivity`), o sistema:
1.  Atualiza o status para `completed`.
2.  Verifica se há decisão/resultado selecionado.
3.  Dispara o evento para o motor de fluxo avançar para o próximo bloco (`nextBlock`).
