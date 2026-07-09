import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Port: honors PORT env (used by preview tooling); defaults to 5173 for `npm run dev`.
export default defineConfig({
  plugins: [react()],
  server: { port: Number(process.env.PORT) || 5173 }
});
