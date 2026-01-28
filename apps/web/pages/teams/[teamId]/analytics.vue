<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">Analytics</h1>

    <div v-if="loading" class="card skeleton h-64"></div>

    <div v-else class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="card">
          <h3 class="text-lg font-semibold mb-2">Participation Rate</h3>
          <p class="text-3xl font-bold">{{ participation.participationRate }}%</p>
          <p class="text-sm text-gray-600 mt-2">
            {{ participation.activeMembers }} of {{ participation.totalMembers }} members
          </p>
        </div>
      </div>

      <div class="card">
        <h3 class="text-lg font-semibold mb-4">Mood Trends</h3>
        <div class="h-64 flex items-center justify-center text-gray-500">
          Chart would be rendered here with Chart.js
        </div>
      </div>

      <div class="card">
        <h3 class="text-lg font-semibold mb-4">Energy Trends</h3>
        <div class="h-64 flex items-center justify-center text-gray-500">
          Chart would be rendered here with Chart.js
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'team-member'],
});

const route = useRoute();
const teamId = route.params.teamId as string;
const api = useApi();

const participation = ref<any>({});
const loading = ref(true);

onMounted(async () => {
  participation.value = await api.get(`/teams/${teamId}/analytics/participation?days=7`);
  loading.value = false;
});
</script>
