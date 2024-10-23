import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    base: '/Measure.app/',
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || ''),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || ''),
      'import.meta.env.VITE_POSTHOG_KEY': JSON.stringify(env.VITE_POSTHOG_KEY || ''),
      'import.meta.env.VITE_POSTHOG_HOST': JSON.stringify(env.VITE_POSTHOG_HOST || ''),
      'import.meta.env.VITE_RESEND_API_KEY': JSON.stringify(env.VITE_RESEND_API_KEY || ''),
    },
    build: {
      rollupOptions: {
        input: {
          main: './index.html',
        },
      },
    },
  }
})
