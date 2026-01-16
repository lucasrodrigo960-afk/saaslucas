import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Fix: Use '.' instead of process.cwd() to resolve the "Property 'cwd' does not exist on type 'Process'" error.
  // In most environments, '.' correctly points to the current directory for loading environment variables.
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    // Note: The manual mapping of process.env.API_KEY in the 'define' block was removed.
    // As per Gemini API guidelines, process.env.API_KEY is assumed to be automatically injected.
    server: {
      port: 3000
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      chunkSizeWarningLimit: 2000
    }
  };
});
