<template>
  <div class="space-y-6">
    <div
      v-for="checkIn in checkIns"
      :key="checkIn.id"
      class="card"
      :class="{ 'border-l-4 border-red-500': checkIn.blockers }"
    >
      <div class="flex items-start justify-between mb-4">
        <div class="flex items-center gap-3">
          <img
            v-if="checkIn.Users?.avatarUrl"
            :src="checkIn.Users.avatarUrl"
            :alt="checkIn.Users.displayName"
            class="w-10 h-10 rounded-full"
          />
          <div>
            <p class="font-semibold">{{ checkIn.Users?.displayName }}</p>
            <p class="text-sm text-gray-500">
              {{ new Date(checkIn.checkInDate).toLocaleDateString() }}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-2xl">{{ getMoodEmoji(checkIn.mood) }}</span>
          <span class="text-sm text-gray-600">Energy: {{ checkIn.energy }}/5</span>
        </div>

        
      <!-- ✏️ Edit button -->
      <NuxtLink
        v-if="canEdit"
        :to="{
          path: `/teams/${teamId}/check-in`,
          query: { edit: true, checkInId: checkIn.id }
        }"
        class="text-xs text-indigo-600 hover:underline"
      >
        Edit
      </NuxtLink>
      </div>

      <div class="space-y-3">
        <div>
          <p class="text-sm font-medium text-gray-700 mb-1">Yesterday:</p>
          <p class="text-gray-900">{{ checkIn.yesterday }}</p>
        </div>
        <div>
          <p class="text-sm font-medium text-gray-700 mb-1">Today:</p>
          <p class="text-gray-900">{{ checkIn.today }}</p>
        </div>
        <div v-if="checkIn.blockers">
          <p class="text-sm font-medium text-red-700 mb-1">Blockers:</p>
          <p class="text-red-900">{{ checkIn.blockers }}</p>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import type { Mood } from '@team-pulse/shared';
import * as Shared from '@team-pulse/shared';
import { useAuthStore } from '@/stores/auth';

interface Props {
  checkIns: any[];
  teamId: string;
}

defineProps<Props>();


const auth = useAuthStore();

const getMoodEmoji = (mood: Mood) => {
  return Shared.MOOD_EMOJIS[mood] || '😐';
};

onMounted(() => {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);

  const timeout = midnight.getTime() - now.getTime();
  setTimeout(() => window.location.reload(), timeout);
});

/**
 * Check if user can still edit:
 * - owns the check-in
 * - same local day (before midnight)
 */
const canEdit = (checkIn: any) => {
  if (checkIn.userId !== auth.user?.id) return false;

  const now = new Date();
  const checkInDate = new Date(checkIn.checkInDate);

  return (
    now.getFullYear() === checkInDate.getFullYear() &&
    now.getMonth() === checkInDate.getMonth() &&
    now.getDate() === checkInDate.getDate()
  );
};

const formatDate = (date: string | Date) =>
  new Date(date).toLocaleString();
</script>
