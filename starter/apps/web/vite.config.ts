import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Load starter/.env (monorepo root) — apps/web has no local .env
const envDir = path.resolve(__dirname, '../..');

export default defineConfig({
  envDir,
  plugins: [tailwindcss(), reactRouter()],
  server: {
    port: Number(process.env.WEB_PORT) || 3000,
  },
});
