import path from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Kept outside node_modules so the dev server works even when the
  // dependency tree is not writable by the current user.
  cacheDir: ".vite",
  // 5173 est pris par le dashboard : les deux tournent cote a cote.
  server: { port: 5174 },
  preview: { port: 5174 },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
