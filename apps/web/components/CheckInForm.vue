<template>
  <form @submit.prevent="handleSubmit" class="card space-y-6">
    <div>
      <label for="yesterday" class="block text-sm font-medium text-gray-700 mb-2">
        What did you accomplish yesterday?
      </label>
      <textarea
        id="yesterday"
        v-model="formData.yesterday"
        required
        :maxlength="1000"
        class="textarea"
        rows="4"
        @input="debouncedSave"
      />
      <p class="text-sm text-gray-500 mt-1">{{ formData.yesterday.length }}/1000</p>
    </div>

    <div>
      <label for="today" class="block text-sm font-medium text-gray-700 mb-2">
        What will you work on today?
      </label>
      <textarea
        id="today"
        v-model="formData.today"
        required
        :maxlength="1000"
        class="textarea"
        rows="4"
        @input="debouncedSave"
      />
      <p class="text-sm text-gray-500 mt-1">{{ formData.today.length }}/1000</p>
    </div>

    <div>
      <label for="blockers" class="block text-sm font-medium text-gray-700 mb-2">
        Any blockers? (optional)
      </label>
      <textarea
        id="blockers"
        v-model="formData.blockers"
        :maxlength="500"
        class="textarea"
        rows="3"
        @input="debouncedSave"
      />
      <p class="text-sm text-gray-500 mt-1">{{ formData.blockers.length }}/500</p>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">How are you feeling?</label>
      <div class="flex gap-4">
        <label
          v-for="mood in moods"
          :key="mood.value"
          class="flex flex-col items-center cursor-pointer"
        >
          <input
            v-model="formData.mood"
            type="radio"
            :value="mood.value"
            class="sr-only"
            @change="debouncedSave"
          />
          <span
            class="text-4xl p-2 rounded-lg transition-all"
            :class="formData.mood === mood.value ? 'bg-blue-100 scale-110' : 'hover:bg-gray-100'"
          >
            {{ mood.emoji }}
          </span>
          <span class="text-xs mt-1 text-gray-600">{{ mood.label }}</span>
        </label>
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Energy Level: {{ formData.energy }}/5
      </label>
      <input
        v-model.number="formData.energy"
        type="range"
        min="1"
        max="5"
        step="1"
        class="w-full"
        @input="debouncedSave"
      />
      <div class="flex justify-between text-xs text-gray-500 mt-1">
        <span>Low</span>
        <span>High</span>
      </div>
    </div>

    <div v-if="error" class="text-red-600 text-sm">{{ error }}</div>

    <div class="flex gap-4">
      <button type="submit" :disabled="loading || !isValid" class="btn btn-primary">
        <span v-if="loading">Submitting...</span>
        <span v-else>Submit Check-in</span>
      </button>
      <NuxtLink :to="`/teams/${teamId}`" class="btn btn-secondary">Cancel</NuxtLink>
    </div>
  </form>
</template>

<script setup lang="ts">
import { Mood, MOOD_LABELS, MOOD_EMOJIS } from '@team-pulse/shared';

interface Props {
  teamId: string;
}

const props = defineProps<Props>();

const { createCheckIn, saveDraft, loadDraft, clearDraft } = useCheckIn();
const router = useRouter();

const formData = ref({
  yesterday: '',
  today: '',
  blockers: '',
  mood: '' as Mood | '',
  energy: 3,
});

const loading = ref(false);
const error = ref('');

const moods = Object.values(Mood).map((mood) => ({
  value: mood,
  label: MOOD_LABELS[mood],
  emoji: MOOD_EMOJIS[mood],
}));

const isValid = computed(() => {
  return (
    formData.value.yesterday.trim().length > 0 &&
    formData.value.today.trim().length > 0 &&
    formData.value.mood !== ''
  );
});

let saveTimeout: NodeJS.Timeout | null = null;

const debouncedSave = () => {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveDraft(props.teamId, formData.value);
  }, 2000);
};

onMounted(() => {
  const draft = loadDraft(props.teamId);
  if (draft) {
    formData.value = {
      yesterday: draft.yesterday || '',
      today: draft.today || '',
      blockers: draft.blockers || '',
      mood: draft.mood || '',
      energy: draft.energy || 3,
    };
  }
});

const handleSubmit = async () => {
  if (!isValid.value) {
    error.value = 'Please fill in all required fields';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    await createCheckIn(props.teamId, {
      yesterday: formData.value.yesterday,
      today: formData.value.today,
      blockers: formData.value.blockers || undefined,
      mood: formData.value.mood as Mood,
      energy: formData.value.energy,
    });
    clearDraft(props.teamId);
    router.push(`/teams/${props.teamId}`);
  } catch (err: any) {
    error.value = err.message || 'Failed to submit check-in';
  } finally {
    loading.value = false;
  }
};
</script>
