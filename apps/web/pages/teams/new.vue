<template>
  <div class="container mx-auto px-4 py-8 max-w-2xl">
    <h1 class="text-3xl font-bold mb-8">Create New Team</h1>

    <form @submit.prevent="handleSubmit" class="card space-y-6">
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
          Team Name
        </label>
        <input
          id="name"
          v-model="name"
          type="text"
          required
          class="input"
          placeholder="Enter team name"
        />
      </div>

      <div>
        <label for="logoUrl" class="block text-sm font-medium text-gray-700 mb-2">
          Logo URL (optional)
        </label>
        <input
          id="logoUrl"
          v-model="logoUrl"
          type="url"
          class="input"
          placeholder="https://example.com/logo.png"
        />
      </div>

      <div v-if="error" class="text-red-600 text-sm">{{ error }}</div>

      <div class="flex gap-4">
        <button type="submit" :disabled="loading" class="btn btn-primary">
          <span v-if="loading">Creating...</span>
          <span v-else>Create Team</span>
        </button>
        <NuxtLink to="/dashboard" class="btn btn-secondary">Cancel</NuxtLink>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
});

const { createTeam } = useTeam();
const router = useRouter();

const name = ref('');
const logoUrl = ref('');
const loading = ref(false);
const error = ref('');

const handleSubmit = async () => {
  loading.value = true;
  error.value = '';

  try {
    const team = await createTeam({
      name: name.value,
      logoUrl: logoUrl.value || undefined,
    });
    router.push(`/teams/${team.id}`);
  } catch (err: any) {
    error.value = err.message || 'Failed to create team';
  } finally {
    loading.value = false;
  }
};
</script>
