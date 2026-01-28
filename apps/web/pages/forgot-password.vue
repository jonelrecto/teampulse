<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Reset your password
        </h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
            Email address
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            class="input"
            placeholder="Enter your email"
          />
        </div>

        <div v-if="error" class="text-red-600 text-sm">{{ error }}</div>
        <div v-if="success" class="text-green-600 text-sm">{{ success }}</div>

        <div>
          <button type="submit" :disabled="loading" class="btn btn-primary w-full">
            <span v-if="loading">Sending...</span>
            <span v-else>Send reset link</span>
          </button>
        </div>

        <div class="text-center">
          <NuxtLink to="/login" class="text-sm text-indigo-600 hover:text-indigo-500">
            Back to login
          </NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
});

const { resetPassword } = useAuth();

const email = ref('');
const loading = ref(false);
const error = ref('');
const success = ref('');

const handleSubmit = async () => {
  loading.value = true;
  error.value = '';
  success.value = '';

  try {
    await resetPassword(email.value);
    success.value = 'Password reset email sent! Check your inbox.';
  } catch (err: any) {
    error.value = err.message || 'Failed to send reset email';
  } finally {
    loading.value = false;
  }
};
</script>
