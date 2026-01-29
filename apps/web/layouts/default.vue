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
          
          <!-- Avatar, User Info, Timezone, and Logout Button on the Right -->
          <div class="flex items-center gap-4">
            <!-- Current Time with Timezone -->
            <div v-if="user" class="flex flex-col items-end text-sm">
              <span class="text-gray-900 font-medium">{{ currentTime }}</span>
              <span class="text-xs text-gray-500">{{ user.timezone }}</span>
            </div>

            <div v-if="user" class="flex items-center gap-3">
              <!-- Clickable Avatar with Upload -->
              <div class="relative group">
                <button 
                  @click="triggerFileInput"
                  class="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold overflow-hidden cursor-pointer hover:ring-2 hover:ring-indigo-400 transition-all relative"
                  :disabled="uploadingAvatar"
                >
                  <img 
                    v-if="user.avatarUrl" 
                    :src="user.avatarUrl" 
                    :alt="user.displayName || user.email"
                    class="w-full h-full object-cover"
                  />
                  <span v-else class="text-sm">
                    {{ getInitials(user.displayName || user.email) }}
                  </span>
                  
                  <!-- Overlay on hover -->
                  <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg v-if="!uploadingAvatar" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <svg v-else class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                </button>
                
                <!-- Hidden file input -->
                <input 
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  @change="handleFileChange"
                  class="hidden"
                />
              </div>

              <div class="flex flex-col">
                <span class="text-sm font-medium text-gray-900">
                  {{ user.displayName || 'User' }}
                </span>
                <span class="text-xs text-gray-500">{{ user.email }}</span>
              </div>
            </div>

            <button 
              @click="handleLogout" 
              class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
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
const authStore = useAuthStore();
const config = useRuntimeConfig();
const fileInput = ref<HTMLInputElement | null>(null);
const currentTime = ref('');

// Use uploadingAvatar from store
const uploadingAvatar = computed(() => authStore.uploadingAvatar);

// Update current time based on user's timezone
const updateTime = () => {
  if (user.value?.timezone) {
    const now = new Date();
    currentTime.value = now.toLocaleTimeString('en-US', {
      timeZone: user.value.timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  }
};

// Update time every second
let timeInterval: NodeJS.Timeout | null = null;

onMounted(() => {
  updateTime();
  timeInterval = setInterval(updateTime, 1000);
});

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval);
  }
});

// Watch for user changes to update time
watch(() => user.value?.timezone, () => {
  updateTime();
});

const handleLogout = async () => {
  await logout();
};

const getInitials = (name: string) => {
  if (!name) return 'U';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const triggerFileInput = () => {
  if (fileInput.value && !uploadingAvatar.value) {
    fileInput.value.click();
  }
};

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (!file) return;

  try {
    // Pass the API base URL to the store action
    await authStore.uploadAvatar(file, config.public.apiBase);
    console.log('Avatar updated successfully');
  } catch (error: any) {
    alert(error.message || 'Failed to upload avatar. Please try again.');
  } finally {
    // Reset file input
    if (target) {
      target.value = '';
    }
  }
};
</script>