
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Garante que process.env.API_KEY seja injetado como string
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
    // Define um fallback para o objeto process.env para evitar erros de referência
    'process.env': {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'production'),
      API_KEY: JSON.stringify(process.env.API_KEY)
    }
  },
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});
