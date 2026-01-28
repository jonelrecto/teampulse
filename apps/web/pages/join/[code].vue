<template>
  <div class="container mx-auto px-4 py-8 max-w-2xl">
    <div v-if="loading" class="card skeleton h-32"></div>

    <div v-else-if="error" class="card">
      <h1 class="text-2xl font-bold mb-4 text-red-600">Error</h1>
      <p class="text-gray-600">{{ error }}</p>
      <NuxtLink to="/dashboard" class="btn btn-primary mt-4">Go to Dashboard</NuxtLink>
    </div>

    <div v-else-if="team" class="card">
      <h1 class="text-2xl font-bold mb-4">Join Team</h1>
      <p class="text-gray-600 mb-6">You've been invited to join: <strong>{{ team.name }}</strong></p>

      <button @click="handleJoin" :disabled="joining" class="btn btn-primary">
        <span v-if="joining">Joining...</span>
        <span v-else>Join Team</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
});

const route = useRoute();
const code = route.params.code as string;
const router = useRouter();

const api = useApi();
const { joinTeam } = useTeam();

const team = ref<any>(null);
const loading = ref(true);
const joining = ref(false);
const error = ref('');

onMounted(async () => {
  try {
    team.value = await api.get(`/teams/join/${code}`);
  } catch (err: any) {
    error.value = err.message || 'Invalid invite code';
  } finally {
    loading.value = false;
  }
});

const handleJoin = async () => {
  joining.value = true;
  error.value = '';

  try {
    await joinTeam(code);
    router.push(`/teams/${team.value.id}`);
  } catch (err: any) {
    error.value = err.message || 'Failed to join team';
  } finally {
    joining.value = false;
  }
};
</script>
