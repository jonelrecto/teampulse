<template>
  <div class="min-h-screen bg-gray-50">
    <nav v-if="isAuthenticated" class="bg-white shadow-sm border-b">
      <div class="container mx-auto px-4">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center gap-6">
            <NuxtLink to="/dashboard" class="text-xl font-bold text-indigo-600">
              Team Pulse
            </NuxtLink>
            <NuxtLink to="/dashboard" class="text-gray-700 hover:text-indigo-600">
              Dashboard
            </NuxtLink>
          </div>
          <div class="flex items-center gap-4">
            <span v-if="user" class="text-sm text-gray-700">{{ user.displayName }}</span>
            <button @click="handleLogout" class="btn btn-secondary text-sm">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
    <main>
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const { user, logout, isAuthenticated } = useAuth();

const handleLogout = async () => {
  await logout();
};
</script>
