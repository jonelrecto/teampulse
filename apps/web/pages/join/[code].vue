<template>
  <div class="container mx-auto px-4 py-8 max-w-2xl">
    <div v-if="loading" class="card skeleton h-32"></div>

    <div v-else-if="error" class="card">
      <h1 class="text-2xl font-bold mb-4 text-red-600">Error</h1>
      <p class="text-gray-600">{{ error }}</p>
      <NuxtLink to="/dashboard" class="btn btn-primary mt-4">Go to Dashboard</NuxtLink>
    </div>

    <div v-else-if="team" class="card">
      <div class="text-center mb-6">
        <img 
          v-if="team.logoUrl" 
          :src="team.logoUrl" 
          :alt="team.name"
          class="w-24 h-24 mx-auto mb-4 rounded-full object-cover"
        />
        <div v-else class="w-24 h-24 mx-auto mb-4 rounded-full bg-indigo-100 flex items-center justify-center">
          <span class="text-3xl font-bold text-indigo-600">{{ getInitials(team.name) }}</span>
        </div>
        <h1 class="text-3xl font-bold mb-2">Join {{ team.name }}</h1>
        <p class="text-gray-600">You've been invited to join this team</p>
      </div>

      <div v-if="!isAuthenticated" class="space-y-4">
        <p class="text-center text-gray-600 mb-6">
          Please sign in or create an account to join this team
        </p>
        <NuxtLink 
          :to="`/login?invite=${code}`" 
          class="btn btn-primary w-full block text-center"
        >
          Sign In
        </NuxtLink>
        <NuxtLink 
          :to="`/register?invite=${code}`" 
          class="btn btn-secondary w-full block text-center"
        >
          Create Account
        </NuxtLink>
      </div>

      <div v-else>
        <button 
          @click="handleJoin" 
          :disabled="joining" 
          class="btn btn-primary w-full"
        >
          <span v-if="joining">Joining...</span>
          <span v-else>Join Team</span>
        </button>
        
        <p class="text-center text-sm text-gray-500 mt-4">
          Already a member? 
          <NuxtLink :to="`/teams/${team.id}`" class="text-indigo-600 hover:text-indigo-500">
            Go to team
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
});

const route = useRoute();
const router = useRouter();
const code = route.params.code as string;
const api = useApi();
const { joinTeam } = useTeam();
const { isAuthenticated } = useAuth();

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

const getInitials = (name: string) => {
  if (!name) return 'T';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const handleJoin = async () => {
  joining.value = true;
  error.value = '';

  try {
    await joinTeam(code);
    router.push(`/teams/${team.value.id}`);
  } catch (err: any) {
    if (err.message?.includes('already a member')) {
      // User is already a member, just redirect to team
      router.push(`/teams/${team.value.id}`);
    } else {
      error.value = err.message || 'Failed to join team';
    }
  } finally {
    joining.value = false;
  }
};
</script>