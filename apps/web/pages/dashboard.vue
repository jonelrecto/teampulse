<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">My Teams</h1>
      <NuxtLink to="/teams/new" class="btn btn-primary">Create Team</NuxtLink>
    </div>

    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 3" :key="i" class="card skeleton h-32"></div>
    </div>

    <div v-else-if="teams.length === 0" class="text-center py-12">
      <p class="text-gray-600 mb-4">You're not part of any teams yet.</p>
      <NuxtLink to="/teams/new" class="btn btn-primary">Create your first team</NuxtLink>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <NuxtLink
        v-for="team in teams"
        :key="team.id"
        :to="`/teams/${team.id}`"
        class="card hover:shadow-lg transition-shadow cursor-pointer"
      >
        <h2 class="text-xl font-semibold mb-2">{{ team.name }}</h2>
        <p class="text-gray-600 text-sm">Invite code: {{ team.inviteCode }}</p>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
});

const { teams, fetchTeams } = useTeam();
const loading = ref(true);

onMounted(async () => {
  await fetchTeams();
  loading.value = false;
});
</script>
