<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <p v-if="inviteTeam" class="mt-2 text-center text-sm text-gray-600">
          You've been invited to join <strong class="text-indigo-600">{{ inviteTeam.name }}</strong>
        </p>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="email" class="sr-only">Email address</label>
            <input
              id="email"
              v-model="email"
              name="email"
              type="email"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Email address"
            />
          </div>
          <div>
            <label for="password" class="sr-only">Password</label>
            <input
              id="password"
              v-model="password"
              name="password"
              type="password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Password"
            />
          </div>
        </div>

        <div v-if="error" class="text-red-600 text-sm text-center">{{ error }}</div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <span v-if="loading">Signing in...</span>
            <span v-else>Sign in</span>
          </button>
        </div>

        <div class="text-center">
          <NuxtLink 
            :to="inviteCode ? `/register?invite=${inviteCode}` : '/register'" 
            class="text-sm text-indigo-600 hover:text-indigo-500"
          >
            Don't have an account? Sign up
          </NuxtLink>
        </div>

        <div class="text-center">
          <NuxtLink to="/forgot-password" class="text-sm text-indigo-600 hover:text-indigo-500">
            Forgot your password?
          </NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: 'guest',
});

const { login } = useAuth();
const { joinTeam } = useTeam();
const router = useRouter();
const route = useRoute();
const api = useApi();

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');
const inviteCode = ref<string | null>(null);
const inviteTeam = ref<any>(null);

// Check for invite code in URL
onMounted(async () => {
  const code = route.query.invite as string;
  if (code) {
    inviteCode.value = code;
    try {
      // Fetch team info to display
      inviteTeam.value = await api.get(`/teams/join/${code}`);
    } catch (err) {
      console.error('Failed to fetch team info:', err);
    }
  }
});

const handleLogin = async () => {
  loading.value = true;
  error.value = '';

  try {
    await login(email.value, password.value);
    
    // If there's an invite code, join the team
    if (inviteCode.value) {
      try {
        await joinTeam(inviteCode.value);
        const team = await api.get(`/teams/join/${inviteCode.value}`);
        router.push(`/teams/${team.id}`);
      } catch (joinError: any) {
        // If already a member or other error, just go to dashboard
        console.error('Failed to join team:', joinError);
        router.push('/dashboard');
      }
    } else {
      router.push('/dashboard');
    }
  } catch (err: any) {
    error.value = err?.message || 'Failed to sign in';
  } finally {
    loading.value = false;
  }
};
</script>