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
      <div
        v-for="team in teams"
        :key="team.id"
        class="card hover:shadow-lg transition-shadow relative"
      >
        <NuxtLink :to="`/teams/${team.id}`" class="block">
          <h2 class="text-xl font-semibold mb-2">{{ team.name }}</h2>
          <p class="text-gray-600 text-sm mb-4">Invite code: {{ team.inviteCode }}</p>
        </NuxtLink>
        
        <button
          @click.stop="copyInviteLink(team.inviteCode)"
          class="w-full px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <svg 
            v-if="!copiedCode || copiedCode !== team.inviteCode"
            xmlns="http://www.w3.org/2000/svg" 
            class="h-4 w-4" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <svg 
            v-else
            xmlns="http://www.w3.org/2000/svg" 
            class="h-4 w-4" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span v-if="!copiedCode || copiedCode !== team.inviteCode">Copy Invite Link</span>
          <span v-else>Copied!</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
});

const { teams, fetchTeams } = useTeam();
const loading = ref(true);
const copiedCode = ref<string | null>(null);

onMounted(async () => {
  await fetchTeams();
  loading.value = false;
});

const copyInviteLink = async (inviteCode: string) => {
  try {
    const inviteLink = `${window.location.origin}/join/${inviteCode}`;
    await navigator.clipboard.writeText(inviteLink);
    
    // Show success feedback
    copiedCode.value = inviteCode;
    
    // Reset after 2 seconds
    setTimeout(() => {
      copiedCode.value = null;
    }, 2000);
  } catch (error) {
    console.error('Failed to copy invite link:', error);
    alert('Failed to copy invite link. Please try again.');
  }
};
</script>