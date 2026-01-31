<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold">{{ currentTeam?.name || 'Team' }}</h1>
        <p class="text-gray-600">Invite code: {{ currentTeam?.inviteCode }}</p>
      </div>
      <div class="flex gap-4">

        <NuxtLink :to="`/teams/${teamId}/check-in`" class="btn btn-primary">
          Submit Check-in
        </NuxtLink>

        <NuxtLink v-if="currentTeam?.TeamMembership.role === 'ADMIN' " :to="`/teams/${teamId}/members`" class="btn btn-secondary">
          Members
        </NuxtLink>

        <NuxtLink :to="`/teams/${teamId}/analytics`" class="btn btn-secondary">
          Analytics
        </NuxtLink>
      </div>
    </div>

    <div v-if="loading" class="space-y-4">
      <div v-for="i in 5" :key="i" class="card skeleton h-24"></div>
    </div>
    <div v-else-if="checkIns.length === 0" class="card text-center py-12">
      <p class="text-gray-600">No check-ins yet. Be the first to submit one!</p>
    </div>

    <div v-else class="space-y-4">
      <CheckInFeed :check-ins="checkIns" :team-id="teamId"/>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'team-member'],
});

const route = useRoute();
const auth = useAuthStore();
const teamId = route.params.teamId as string;

const { currentTeam, fetchTeam } = useTeam();
const { fetchCheckIns } = useCheckIn();

const checkIns = ref<any[]>([]);
const loading = ref(true);

onMounted(async () => {
  await fetchTeam(teamId);
  const result = await fetchCheckIns(teamId, { limit: 20 });
  checkIns.value = result || [];
  loading.value = false;
});
</script>
