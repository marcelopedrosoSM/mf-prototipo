import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
  },
      {
        path: '/conversations',
        name: 'conversations',
        component: () => import('@/views/ConversationsView.vue'),
      },
      {
        path: '/flows',
        name: 'flows',
        component: () => import('@/views/FlowsView.vue'),
      },
      {
        path: '/flows/atividades',
        name: 'flows-atividades',
        component: () => import('@/views/FlowsAtividadesView.vue'),
      },
      {
        path: '/fluxos/:id',
        name: 'fluxos-edit',
        component: () => import('@/views/flowBuilderChat.vue'),
      },
      {
        path: '/contacts',
        name: 'contacts',
        component: () => import('@/views/ContactsView.vue'),
      },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/SettingsView.vue'),
    redirect: '/settings/agentes',
    children: [
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
        path: 'notificacoes',
        name: 'settings-notificacoes',
        component: () => import('@/views/NotificacoesView.vue'),
      },
      {
        path: 'mensagens-rapidas',
        name: 'settings-mensagens-rapidas',
        component: () => import('@/views/MensagensRapidasView.vue'),
      },
      {
        path: 'feriados-inatividades',
        name: 'settings-feriados-inatividades',
        component: () => import('@/views/HolidaysAndInactivitiesView.vue'),
      },
      {
        path: 'tokens-api',
        name: 'settings-tokens-api',
        component: () => import('@/views/TokensApiView.vue'),
      },
    ],
  },
  {
    path: '/auth/forgot-password',
    name: 'forgot-password',
    component: () => import('@/views/LoginView.vue'), // Placeholder - pode criar uma view específica depois
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;

