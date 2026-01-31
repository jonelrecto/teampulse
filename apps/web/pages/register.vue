<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p v-if="inviteTeam" class="mt-2 text-center text-sm text-gray-600">
          Join <strong class="text-indigo-600">{{ inviteTeam.name }}</strong> after signing up
        </p>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
        <div class="rounded-md shadow-sm space-y-4">
          <div>
            <label for="displayName" class="block text-sm font-medium text-gray-700">
              Display Name
            </label>
            <input
              id="displayName"
              v-model="displayName"
              name="displayName"
              type="text"
              required
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Your name"
            />
          </div>
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              v-model="email"
              name="email"
              type="email"
              required
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Email address"
            />
          </div>
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              v-model="password"
              name="password"
              type="password"
              required
              minlength="6"
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Password (min 6 characters)"
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
            <span v-if="loading">Creating account...</span>
            <span v-else>Create account</span>
          </button>
        </div>

        <div class="text-center">
          <NuxtLink 
            :to="inviteCode ? `/login?invite=${inviteCode}` : '/login'" 
            class="text-sm text-indigo-600 hover:text-indigo-500"
          >
            Already have an account? Sign in
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

const { register } = useAuth();
const { joinTeam } = useTeam();
const router = useRouter();
const route = useRoute();
const api = useApi();

const displayName = ref('');
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

const handleRegister = async () => {
  loading.value = true;
  error.value = '';

  try {
    await register(email.value, password.value, displayName.value);
    
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
    error.value = err.message || 'Failed to create account';
  } finally {
    loading.value = false;
  }
};
</script>