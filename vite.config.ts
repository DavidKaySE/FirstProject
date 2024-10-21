import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: '/Measure.app/',
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(import.meta.env.VITE_SUPABASE_URL),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(import.meta.env.VITE_SUPABASE_ANON_KEY),
    'import.meta.env.VITE_POSTHOG_KEY': JSON.stringify(import.meta.env.VITE_POSTHOG_KEY),
    'import.meta.env.VITE_POSTHOG_HOST': JSON.stringify(import.meta.env.VITE_POSTHOG_HOST),
  },
});
