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
      <label class="block text-sm font-medium text-gray-700 mb-2">How are you feeling? <strong style="color: red">*</strong></label>
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
        Energy Level: {{ formData.energy }}/5 <strong style="color: red">*</strong>
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

    <!-- Attachments -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Attachments (max 3)
      </label>

      <input
        type="file"
        multiple
        accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
        class="block w-full text-sm text-gray-700"
        @change="handleFiles"
      />

      <p class="text-xs text-gray-500 mt-1">
        You can upload up to 3 files
      </p>

      <ul v-if="attachments.length" class="mt-3 space-y-2">
        <li
          v-for="(file, index) in attachments"
          :key="index"
          class="flex items-center justify-between bg-gray-100 px-3 py-2 rounded"
        >
          <span class="text-sm truncate">{{ file.name }} ({{ (file.size / 1024).toFixed(0) }} KB)</span>
          <button
            type="button"
            class="text-red-600 text-xs hover:underline"
            @click="removeFile(index)"
          >
            Remove
          </button>
        </li>
      </ul>
    </div>

    <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-600 text-sm mb-2">{{ error }}</p>
      <NuxtLink 
        v-if="existingCheckIn != null" 
        :to="{ query: { edit: true, checkInId: existingCheckIn.id }}"
        @click="editExistingCheckIn"
        class="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Edit today's check-in
      </NuxtLink>
    </div>

    <div class="flex gap-4">
      <button type="submit" :disabled="loading" class="btn btn-primary">
        <span v-if="loading">Submitting...</span>
        <span v-else>{{ route.query.edit ? 'Update' : 'Submit' }} Check-in</span>
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

const { createCheckIn, updateCheckIn, saveDraft, loadDraft, clearDraft, uploadAttachment } = useCheckIn();
const router = useRouter();
const route = useRoute();

const formData = ref({
  yesterday: '',
  today: '',
  blockers: '',
  mood: '' as Mood | '',
  energy: null as number | null,
});

const loading = ref(false);
const error = ref('');
const existingCheckIn = ref(null);
const attachments = ref<File[]>([]);


const isValid = computed(() => {
  return (
    formData.value.yesterday.trim().length > 0 &&
    formData.value.today.trim().length > 0 &&
    formData.value.mood !== '' &&
    formData.value.energy !== null
  );
});

const moods = Object.values(Mood).map((mood) => ({
  value: mood,
  label: MOOD_LABELS[mood],
  emoji: MOOD_EMOJIS[mood],
}));


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

const handleFiles = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files) return;

  const selected = Array.from(input.files);

  if (attachments.value.length + selected.length > 3) {
    error.value = 'You can only upload up to 3 attachments';
    return;
  }

  error.value = '';

  for (const file of selected) {
    try {
      const compressed =
        file.type.startsWith('image/')
          ? await compressImage(file)
          : file;

      attachments.value.push(compressed);
    } catch (err) {
      console.error('Compression failed', err);
      error.value = 'Failed to process one of the attachments';
    }
  }

  // reset input so same file can be re-selected
  input.value = '';
};

const removeFile = (index: number) => {
  attachments.value.splice(index, 1);
};

const handleSubmit = async () => {

  if (!isValid.value) {
    error.value = 'Please fill in all required fields';
    return;
  }

  loading.value = true;
  error.value = '';

  try {

    if (!route.query.edit) {
      const checkIn = await createCheckIn(props.teamId, {
        teamId: props.teamId,
        yesterday: formData.value.yesterday,
        today: formData.value.today,
        blockers: formData.value.blockers || undefined,
        mood: formData.value.mood as Mood,
        energy: formData.value.energy!,
      });
  
      if (checkIn.statusCode === 409) {
        error.value = checkIn.message || 'Failed to submit check-in';
        existingCheckIn.value = checkIn.data;
        attachments.value = [];
        return;
      }

    } else {
      const checkIn = await updateCheckIn(props.teamId, route.query.checkInId, {
        yesterday: formData.value.yesterday,
        today: formData.value.today,
        blockers: formData.value.blockers || undefined,
        mood: formData.value.mood as Mood,
        energy: formData.value.energy!,
      });
    }
    
    // 🔼 Upload attachments (if any)
    for (const file of attachments.value) {
      await uploadAttachment(props.teamId, checkIn.id, file);
    }

    clearDraft(props.teamId);
    router.push(`/teams/${props.teamId}`);
  } catch (err: any) {
    console.log(err, 'errr');
    error.value = err.message || 'Failed to submit check-in';
  } finally {
    loading.value = false;
  }
};

const editExistingCheckIn = () => {
  // Fill the fields based on the existing check-in
  formData.value = {
    ...existingCheckIn.value
  }

  saveDraft(props.teamId, formData.value);
};

const compressImage = (
  file: File,
  options = {
    maxWidth: 1920,
    maxHeight: 1920,
    quality: 0.7,
  }
): Promise<File> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return resolve(file);
    }

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;

      // Maintain aspect ratio
      if (width > options.maxWidth) {
        height *= options.maxWidth / width;
        width = options.maxWidth;
      }

      if (height > options.maxHeight) {
        width *= options.maxHeight / height;
        height = options.maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('Canvas error');

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject('Compression failed');

          const compressedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now(),
          });

          resolve(compressedFile);
        },
        file.type,
        options.quality
      );
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};


</script>
