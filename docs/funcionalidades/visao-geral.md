# Visão Geral e Regras de Negócio

Este documento descreve os conceitos fundamentais do sistema Myflows, focando nas regras de negócio que governam o roteamento de conversas, atribuição e estrutura organizacional.

## 1. Estrutura de Atendimento

### Caixas de Entrada (Inboxes)
Uma **Caixa de Entrada** representa um canal de comunicação, geralmente associado a um número de telefone (WhatsApp Oficial ou Não-Oficial).
*   Toda conversa que entra no sistema pertence a uma Caixa de Entrada específica.
*   Uma conversa é iniciada quando um contato envia mensagem para uma Caixa, ou quando o sistema inicia uma conversa ativa através dessa Caixa.

### Contatos e Multi-Caixa
*   Um **Contato** é uma entidade única no sistema, identificada geralmente pelo seu número de telefone.
*   Um mesmo contato pode ter conversas abertas em **múltiplas Caixas de Entrada** simultaneamente.
    *   *Exemplo:* O cliente João pode estar falando com o "Suporte" (Caixa A) e com o "Comercial" (Caixa B) ao mesmo tempo. São tratadas como conversas distintas.

## 2. Regras de Atribuição

### Responsabilidade Única
Para garantir clareza no atendimento, o sistema impõe regras estritas de propriedade sobre a conversa:

1.  **Agente Único:** Uma conversa nunca pode ter mais de um agente humano atribuído simultaneamente.
2.  **Times (Filas):** Uma conversa pode estar atribuída a um Time (aguardando atendimento).
3.  **Fluxo Automático:** Se não houver agente ou time, a conversa pode estar sob controle de um **Fluxo Automatizado** (Bot).

### Ciclo de Atribuição
1.  **Entrada:** A conversa chega na Caixa.
2.  **Automação:** Geralmente é interceptada por uma Automação (ex: "Fluxo Unificado").
3.  **Distribuição:** A automação pode direcionar para um Agente específico ou para um Time.
    *   Se for para um Time, a conversa fica aguardando ("Fila").
    *   O sistema pode distribuir automaticamente para agentes dentro desse time (Round Robin, etc - *a confirmar implementação*).
