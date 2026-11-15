import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The frontend never sees the API key: all /api calls are proxied to the Node server.
// VITE_BASE is set when building the public GitHub Pages demo (served from /shadowcase-ai/).
export default defineConfig({
  base: process.env.VITE_BASE ?? "/",
  plugins: [react()],
  server: { port: 5173, proxy: { "/api": `http://localhost:${process.env.API_PORT ?? 8787}` } },
});
