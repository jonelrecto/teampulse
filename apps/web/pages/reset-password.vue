<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Set new password
        </h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
            New Password
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            minlength="6"
            class="input"
            placeholder="Enter new password"
          />
        </div>

        <div>
          <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            required
            class="input"
            placeholder="Confirm new password"
          />
        </div>

        <div v-if="error" class="text-red-600 text-sm">{{ error }}</div>
        <div v-if="success" class="text-green-600 text-sm">{{ success }}</div>

        <div>
          <button type="submit" :disabled="loading" class="btn btn-primary w-full">
            <span v-if="loading">Updating...</span>
            <span v-else>Update password</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: 'guest',
});

const { updatePassword } = useAuth();
const router = useRouter();

const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const error = ref('');
const success = ref('');

const handleSubmit = async () => {
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match';
    return;
  }

  loading.value = true;
  error.value = '';
  success.value = '';

  try {
    await updatePassword(password.value);
    success.value = 'Password updated successfully! Redirecting...';
    setTimeout(() => {
      router.push('/dashboard');
    }, 2000);
  } catch (err: any) {
    error.value = err.message || 'Failed to update password';
  } finally {
    loading.value = false;
  }
};
</script>
