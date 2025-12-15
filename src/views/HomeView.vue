<template>
  <div class="container mx-auto p-8">
    <h1 class="text-4xl font-bold mb-4">MF Protótipo</h1>
    <p class="text-muted-foreground mb-8">
      Stack de prototipagem com Vue 3, TypeScript, Tailwind CSS e Shadcn-vue
    </p>

    <div class="space-y-4">
      <div class="p-4 border rounded-lg">
        <h2 class="text-2xl font-semibold mb-2">Pinia Store Example</h2>
        <p class="mb-4">Count: {{ exampleStore.count }}</p>
        <div class="flex gap-2">
          <Button @click="exampleStore.increment">Increment</Button>
          <Button @click="exampleStore.decrement" variant="outline">Decrement</Button>
        </div>
      </div>

      <div class="p-4 border rounded-lg">
        <h2 class="text-2xl font-semibold mb-2">API Example (MSW Mocked)</h2>
        <Button @click="fetchUsers" :disabled="loading">
          {{ loading ? 'Loading...' : 'Fetch Users' }}
        </Button>
        <div v-if="users.length > 0" class="mt-4">
          <ul class="space-y-2">
            <li v-for="user in users" :key="user.id" class="p-2 bg-muted rounded">
              {{ user.name }} - {{ user.email }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useExampleStore } from '@/stores/example';
import api from '@/services/api';
import type { User } from '@/types';
import { Button } from '@/components/ui/button';

const exampleStore = useExampleStore();
const users = ref<User[]>([]);
const loading = ref(false);

async function fetchUsers() {
  loading.value = true;
  try {
    const response = await api.get<{ users: User[] }>('/users');
    users.value = response.data.users;
  } catch (error) {
    console.error('Error fetching users:', error);
  } finally {
    loading.value = false;
  }
}
</script>

