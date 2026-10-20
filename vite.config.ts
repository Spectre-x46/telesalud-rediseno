import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  // docs/ se publica junto a la demo: auditoría, propuesta y capturas del antes y después.
  publicDir: 'docs',
});
