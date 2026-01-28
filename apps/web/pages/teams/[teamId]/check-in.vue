<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <h1 class="text-3xl font-bold mb-8">Submit Check-in</h1>
    <CheckInForm :team-id="teamId" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'team-member'],
});

const route = useRoute();
const teamId = route.params.teamId as string;
</script>
