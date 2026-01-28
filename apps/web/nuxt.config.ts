// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxtjs/supabase', '@pinia/nuxt'],
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_ANON_KEY,
    redirectOptions: {
      login: '/login',
      callback: '/dashboard',
      exclude: ['/', '/register', '/forgot-password', '/reset-password', '/join/*'],
    },
  },
  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL || 'http://localhost:3001', 
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_ANON_KEY,
      supabasePublishableKey: process.env.SUPABASE_PUBLISHABLE_KEY
    },
  },
  css: ['~/assets/css/main.css'],
  typescript: {
    strict: true,
  },
  // Disable ESLint module if causing issues with native bindings
  // You can enable it later once dependencies are properly installed
  // eslint: {
  //   enabled: false,
  // },
});
