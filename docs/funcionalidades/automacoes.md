# Documentação: Automações

Automações são regras de negócio configuradas por Caixa de Entrada que interceptam eventos e executam fluxos de ações.

**Arquivos de Referência:**
*   Tipos: `src/types/automation.ts`
*   Store: `src/stores/automations.ts`

## 1. Conceito Principal

Cada Caixa de Entrada possui seu próprio conjunto de automações. Uma automação é definida por um **Gatilho** (o evento que a inicia) e um **Fluxo** (a sequência de blocos executados).

### Interface `Automation`
```typescript
export interface Automation {
    id: string;
    nome: string;
    caixaId: string;            // Vinculada a uma caixa específica
    gatilho: AutomationTrigger; // Tipo do evento
    ativo: boolean;             // Se está rodando
    nodes: AutomationNode[];    // Blocos visuais
    edges: AutomationEdge[];    // Conexões
    // ...
}
```

## 2. Gatilhos Disponíveis (`AutomationTrigger`)

O sistema suporta os seguintes gatilhos (definidos em `TRIGGER_CONFIG`):

| Gatilho | Descrição | Comportamento Ideal |
| :--- | :--- | :--- |
| `fluxo_unificado` | Fluxo de Atendimento | **Principal.** Gerencia todas as regras em um único lugar. |
| `horario_atendimento` | Horário de Atendimento | Dispara verificações de horário específicas. |
| `conversa_criada` | Conversa Criada | Dispara apenas na **primeira mensagem** de uma nova conversa. |
| `mensagem_recebida` | Mensagem Recebida | Dispara a cada mensagem recebida (cuidado com loops). |
| `mensagem_enviada` | Mensagem Enviada | Dispara quando o agente envia mensagem. |
| `conversa_finalizada`| Conversa Finalizada | Gatilho pós-atendimento (ex: pesquisa de satisfação). |

## 3. Regras de Exclusividade (Lógica da Store)

Implementado em `useAutomationsStore` (`src/stores/automations.ts`), o sistema força uma regra de exclusividade para manter a sanidade do processamento:

> **Regra:** Apenas **UMA** automação pode estar ativa para o mesmo `gatilho` na mesma `caixaId`.

**Comportamento ao Ativar/Criar:**
Ao ativar uma automação (via `addAutomation` ou `toggleAutomation`), a store automaticamente **desativa** todas as outras automações que compartilhem o mesmo:
1.  `caixaId`
2.  `gatilho`

Isso previne conflitos onde dois fluxos tentariam responder ao mesmo evento "Mensagem Recebida" na mesma caixa.

## 4. Blocos de Automação

Os blocos disponíveis variam conforme o gatilho (`AUTOMATION_BLOCKS` em `automation.ts`).

### Gatilho: `fluxo_unificado`
Suporta a maior variedade de blocos, atuando como um "Super Fluxo":
*   **Gatilhos Internos:** `trigger_message_received`, `trigger_conversation_created`, etc. (Permite segmentar lógica dentro do mesmo fluxo visual).
*   **Ações:** Enviar Mensagem, Perguntas, Ações de Sistema.
*   **Controle:** Verificar Feriado, Horário de Atendimento, Condições.
*   **Sub-fluxos:** `chat_flow` (Conectar a outro fluxo salvo no builder).

### Gatilho: `horario_atendimento`
Escopo mais restrito, focado em triagem temporal:
*   Verificar Feriado
*   Verificar Horário de Atendimento
*   Mensagem (Resposta automática)
