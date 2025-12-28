import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { useAuthStore, useUserPreferencesStore } from '@/stores';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
  },
  {
    path: '/painel',
    name: 'painel',
    component: () => import('@/views/DashboardView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/conversas',
    name: 'conversations',
    component: () => import('@/views/ConversationsView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/fluxos',
    redirect: '/fluxos/atendimento',
  },
  {
    path: '/fluxos/atendimento',
    name: 'flows-atendimento-list',
    component: () => import('@/views/FlowsView.vue'),
    meta: { requiresAuth: true, hideList: true },
  },
  {
    path: '/fluxos/atividades',
    name: 'flows-atividades-list',
    component: () => import('@/views/FlowsView.vue'),
    meta: { requiresAuth: true, hideList: true },
  },

  {
    path: '/configuracoes/fluxos/:id',
    name: 'fluxos-edit',
    component: () => import('@/views/flowBuilderChat.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/configuracoes/fluxos-atividades/:id',
    name: 'fluxos-atividades-edit',
    component: () => import('@/views/flowBuilderTask.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/execucao',
    name: 'execucao',
    component: () => import('@/views/ExecutionModeView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/contatos',
    name: 'contacts',
    component: () => import('@/views/ContactsView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/configuracoes',
    name: 'settings',
    component: () => import('@/views/SettingsView.vue'),
    redirect: '/configuracoes/fluxos',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'preferencias',
        name: 'settings-preferencias',
        component: () => import('@/views/PreferenciasView.vue'),
      },
      {
        path: 'agentes',
        name: 'settings-agentes',
        component: () => import('@/views/AgentesView.vue'),
      },
      {
        path: 'times',
        name: 'settings-times',
        component: () => import('@/views/TimesView.vue'),
      },
      {
        path: 'caixas-entrada',
        name: 'settings-caixas-entrada',
        component: () => import('@/views/CaixasEntradaView.vue'),
      },
      {
        path: 'mensagens-rapidas',
        name: 'settings-mensagens-rapidas',
        component: () => import('@/views/MensagensRapidasView.vue'),
      },
      {
        path: 'ausencias',
        name: 'settings-ausencias',
        component: () => import('@/views/AusenciasView.vue'),
      },
      {
        path: 'tokens-api',
        name: 'settings-tokens-api',
        component: () => import('@/views/TokensApiView.vue'),
      },
      {
        path: 'automacoes',
        name: 'settings-automacoes',
        component: () => import('@/views/AutomacoesView.vue'),
      },
      {
        path: 'fluxos',
        redirect: '/configuracoes/fluxos/atendimento',
      },
      {
        path: 'fluxos/atendimento',
        name: 'flows-atendimento',
        component: () => import('@/views/FlowsView.vue'),
      },
      {
        path: 'fluxos/atividades',
        name: 'flows-atividades',
        component: () => import('@/views/FlowsView.vue'),
      },
    ],
  },
  {
    path: '/auth/forgot-password',
    name: 'forgot-password',
    component: () => import('@/views/LoginView.vue'), // Placeholder - pode criar uma view específica depois
  },
  {
    path: '/clear-localstorage',
    name: 'clear-localstorage',
    component: () => import('@/views/ClearLocalStorageView.vue'),
  },

  {
    path: '/automacoes/:caixaId/:gatilhoTipo/:automacaoId',
    name: 'automation-builder',
    component: () => import('@/views/automationBuilder.vue'),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Navigation guard para proteger rotas autenticadas
router.beforeEach((to, _from, next) => {
  try {
    const authStore = useAuthStore();

    // Verifica se a rota requer autenticação
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

    if (!requiresAuth) {
      // Rotas públicas - permite acesso
      if (to.name === 'login') {
        // Se já estiver autenticado, redireciona para a rota preferida do usuário
        const hasToken = !!authStore.token;
        const hasUser = !!authStore.user;
        if (hasToken && hasUser) {
          const preferencesStore = useUserPreferencesStore();
          const defaultRoute = preferencesStore.defaultRoute;
          next({ name: defaultRoute });
        } else {
          next();
        }
      } else {
        next();
      }
      return;
    }

    // Rotas protegidas - verifica autenticação
    const hasToken = !!authStore.token;
    const hasUser = !!authStore.user;
    const isAuthenticated = hasToken && hasUser;

    if (!isAuthenticated) {
      // Não autenticado - redireciona para login
      next({
        name: 'login',
        query: { redirect: to.fullPath }
      });
    } else {
      // Autenticado - permite acesso
      next();
    }
  } catch (error) {
    console.error('Erro no navigation guard:', error);
    // Em caso de erro, permite a navegação para evitar bloqueio total
    next();
  }
});

export default router;

