<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">Team Members</h1>

    <div v-if="loading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="card skeleton h-20"></div>
    </div>

    <div v-else class="card">
      <div class="space-y-4">
        <div
          v-for="member in members"
          :key="member.id"
          class="flex items-center justify-between p-4 border-b last:border-b-0"
        >
          <div class="flex items-center gap-3">
            <img
              v-if="member.user?.avatarUrl"
              :src="member.user.avatarUrl"
              :alt="member.user.displayName"
              class="w-10 h-10 rounded-full"
            />
            <div>
              <p class="font-semibold">{{ member.user?.displayName }}</p>
              <p class="text-sm text-gray-600">{{ member.user?.email }}</p>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <span
              class="px-2 py-1 text-xs rounded"
              :class="member.role === 'ADMIN' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'"
            >
              {{ member.role }}
            </span>
          </div>
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

const { members, fetchMembers } = useTeam();
const loading = ref(true);

onMounted(async () => {
  await fetchMembers(teamId);
  loading.value = false;
});
</script>
