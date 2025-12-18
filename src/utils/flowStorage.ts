/**
 * Utilitários para gerenciar fluxos no localStorage
 */

export interface FlowData {
    id: string;
    nome: string;
    descricao?: string;
    nodes: any[];
    edges: any[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

const STORAGE_KEY = 'myflows_builder_flows';

/**
 * Salvar fluxo no localStorage
 */
export function saveFlowToLocalStorage(flowData: FlowData): void {
    try {
        const flows = getAllFlows();
        const existingIndex = flows.findIndex(f => f.id === flowData.id);

        const updatedFlow = {
            ...flowData,
            updatedAt: new Date().toISOString(),
        };

        if (existingIndex >= 0) {
            flows[existingIndex] = updatedFlow;
        } else {
            flows.push({
                ...updatedFlow,
                createdAt: new Date().toISOString(),
            });
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(flows));
        console.log('✅ Fluxo salvo no localStorage:', flowData.id);
    } catch (error) {
        console.error('❌ Erro ao salvar fluxo:', error);
        throw error;
    }
}

/**
 * Carregar fluxo específico do localStorage
 */
export function loadFlowFromLocalStorage(flowId: string): FlowData | null {
    try {
        const flows = getAllFlows();
        const flow = flows.find(f => f.id === flowId);

        if (flow) {
            console.log('✅ Fluxo carregado do localStorage:', flowId);
            return flow;
        }

        console.warn('⚠️ Fluxo não encontrado:', flowId);
        return null;
    } catch (error) {
        console.error('❌ Erro ao carregar fluxo:', error);
        return null;
    }
}

/**
 * Obter todos os fluxos do localStorage
 */
export function getAllFlows(): FlowData[] {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('❌ Erro ao carregar fluxos:', error);
        return [];
    }
}

/**
 * Deletar fluxo do localStorage
 */
export function deleteFlowFromLocalStorage(flowId: string): void {
    try {
        const flows = getAllFlows();
        const filteredFlows = flows.filter(f => f.id !== flowId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredFlows));
        console.log('✅ Fluxo deletado do localStorage:', flowId);
    } catch (error) {
        console.error('❌ Erro ao deletar fluxo:', error);
        throw error;
    }
}

/**
 * Limpar todos os fluxos do localStorage
 */
export function clearAllFlows(): void {
    try {
        localStorage.removeItem(STORAGE_KEY);
        console.log('✅ Todos os fluxos foram removidos do localStorage');
    } catch (error) {
        console.error('❌ Erro ao limpar fluxos:', error);
        throw error;
    }
}

/**
 * Exportar fluxo como JSON
 */
export function exportFlowAsJSON(flowId: string): void {
    const flow = loadFlowFromLocalStorage(flowId);
    if (!flow) {
        console.error('Fluxo não encontrado');
        return;
    }

    const dataStr = JSON.stringify(flow, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `flow-${flow.nome.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.json`;
    link.click();

    URL.revokeObjectURL(url);
    console.log('✅ Fluxo exportado como JSON');
}

/**
 * Importar fluxo de JSON
 */
export function importFlowFromJSON(file: File): Promise<FlowData> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const flowData = JSON.parse(e.target?.result as string);

                // Validar estrutura básica
                if (!flowData.id || !flowData.nome || !flowData.nodes || !flowData.edges) {
                    throw new Error('Arquivo JSON inválido');
                }

                // Gerar novo ID para evitar conflitos
                flowData.id = `imported-${Date.now()}`;
                flowData.createdAt = new Date().toISOString();
                flowData.updatedAt = new Date().toISOString();

                saveFlowToLocalStorage(flowData);
                console.log('✅ Fluxo importado com sucesso');
                resolve(flowData);
            } catch (error) {
                console.error('❌ Erro ao importar fluxo:', error);
                reject(error);
            }
        };

        reader.onerror = () => {
            reject(new Error('Erro ao ler arquivo'));
        };

        reader.readAsText(file);
    });
}
