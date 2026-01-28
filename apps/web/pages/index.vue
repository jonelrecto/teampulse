<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="container mx-auto px-4 py-16">
      <div class="text-center max-w-4xl mx-auto">
        <h1 class="text-5xl font-bold text-gray-900 mb-4">Team Pulse</h1>
        <p class="text-xl text-gray-600 mb-8">
          Async standup and check-in tool for remote teams
        </p>
        <div class="flex gap-4 justify-center">
          <NuxtLink to="/register" class="btn btn-primary text-lg px-8 py-3">
            Get Started
          </NuxtLink>
          <NuxtLink to="/login" class="btn btn-secondary text-lg px-8 py-3">
            Sign In
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
});
</script>
