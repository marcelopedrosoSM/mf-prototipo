/**
 * Gerador de IDs sequenciais para o protótipo
 */

let flowIdCounter = 0;

// Inicializar contador baseado nos mocks existentes
export function initializeFlowIdCounter(maxId: number) {
  flowIdCounter = Math.max(flowIdCounter, maxId);
}

/**
 * Gera um novo ID sequencial para fluxos
 */
export function generateFlowId(): string {
  flowIdCounter++;
  return String(flowIdCounter);
}

/**
 * Reseta o contador (útil para testes)
 */
export function resetFlowIdCounter() {
  flowIdCounter = 0;
}

