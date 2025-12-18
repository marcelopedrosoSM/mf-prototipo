/**
 * Teste manual das Pinia Stores
 * 
 * Para testar, cole este código no console do navegador (DevTools)
 * quando a aplicação estiver rodando.
 */

// 1. Teste da Auth Store
console.log('=== Testando Auth Store ===');
import { useAuthStore } from '@/stores';

const authStore = useAuthStore();

// Testar login
authStore.setAuth('test-token-123', {
    id: '1',
    nome: 'Teste Usuario',
    email: 'teste@example.com',
    avatar: 'https://example.com/avatar.jpg',
    role: 'admin'
});

console.log('✅ Login realizado');
console.log('Token:', authStore.token);
console.log('User:', authStore.user);
console.log('Is Authenticated:', authStore.isAuthenticated);
console.log('User Name:', authStore.userName);

// Verificar persistência
console.log('LocalStorage auth:', localStorage.getItem('auth'));

// Testar logout
authStore.clearAuth();
console.log('✅ Logout realizado');
console.log('Is Authenticated:', authStore.isAuthenticated);

// ---

// 2. Teste da Theme Store
console.log('\n=== Testando Theme Store ===');
import { useThemeStore } from '@/stores';

const themeStore = useThemeStore();

console.log('Tema atual:', themeStore.theme);
console.log('Is Dark:', themeStore.isDark);
console.log('Effective Theme:', themeStore.effectiveTheme);

// Testar mudança de tema
themeStore.setTheme('dark');
console.log('✅ Tema mudado para dark');
console.log('Is Dark:', themeStore.isDark);

themeStore.toggleTheme();
console.log('✅ Tema alternado');
console.log('Tema atual:', themeStore.theme);

// Verificar persistência
console.log('LocalStorage theme:', localStorage.getItem('myflows-theme'));

// ---

// 3. Teste da Flows Store
console.log('\n=== Testando Flows Store ===');
import { useFlowsStore } from '@/stores';

const flowsStore = useFlowsStore();

// Salvar um fluxo
flowsStore.saveFlow({
    id: 'test-flow-1',
    nome: 'Fluxo de Teste',
    descricao: 'Descrição do fluxo de teste',
    nodes: [{ id: 'node-1', type: 'trigger', position: { x: 0, y: 0 }, data: {} }],
    edges: [],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
});

console.log('✅ Fluxo salvo');
console.log('Total de fluxos:', flowsStore.flowCount);
console.log('Fluxos salvos:', flowsStore.savedFlows);

// Carregar fluxo
const loadedFlow = flowsStore.loadFlow('test-flow-1');
console.log('✅ Fluxo carregado:', loadedFlow);
console.log('Fluxo atual:', flowsStore.currentFlow);

// Verificar persistência
console.log('LocalStorage flows:', localStorage.getItem('myflows-saved-flows'));

// Deletar fluxo
flowsStore.deleteFlow('test-flow-1');
console.log('✅ Fluxo deletado');
console.log('Total de fluxos:', flowsStore.flowCount);

// ---

// 4. Teste da Notifications Store
console.log('\n=== Testando Notifications Store ===');
import { useNotificationsStore } from '@/stores';

const notificationsStore = useNotificationsStore();

console.log('Configurações atuais:', notificationsStore.settings);
console.log('Sound enabled:', notificationsStore.isSoundEnabled);

// Atualizar configurações
notificationsStore.setSoundEnabled(false);
console.log('✅ Som desabilitado');
console.log('Sound enabled:', notificationsStore.isSoundEnabled);

notificationsStore.updateSettings({
    soundEnabled: true,
    desktopEnabled: false,
    emailEnabled: true,
});
console.log('✅ Configurações atualizadas');
console.log('Configurações:', notificationsStore.settings);

// Verificar persistência
console.log('LocalStorage notifications:', localStorage.getItem('myflows-notifications'));

// ---

console.log('\n=== ✅ Todos os testes concluídos! ===');
console.log('Verifique o localStorage para confirmar a persistência.');
