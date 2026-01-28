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
            v-if="checkIn.user?.avatarUrl"
            :src="checkIn.user.avatarUrl"
            :alt="checkIn.user.displayName"
            class="w-10 h-10 rounded-full"
          />
          <div>
            <p class="font-semibold">{{ checkIn.user?.displayName }}</p>
            <p class="text-sm text-gray-500">
              {{ new Date(checkIn.checkInDate).toLocaleDateString() }}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-2xl">{{ getMoodEmoji(checkIn.mood) }}</span>
          <span class="text-sm text-gray-600">Energy: {{ checkIn.energy }}/5</span>
        </div>
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
import { MOOD_EMOJIS, Mood } from '@team-pulse/shared';

interface Props {
  checkIns: any[];
}

defineProps<Props>();

const getMoodEmoji = (mood: Mood) => {
  return MOOD_EMOJIS[mood] || '😐';
};
</script>
