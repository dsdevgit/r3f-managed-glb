import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

// the host project already ships with all of these — never bundle
// the list of external deps that are kept external to the build output
const externals = ['react', 'react/jsx-runtime', '@react-three/fiber', '@react-three/drei', 'three'];

export default defineConfig({
  plugins: [
    react(),
    dts({
      exclude: ['**/*.test.ts', '**/*.test.tsx']
    })
  ],
  build: {
    lib: {
      entry: './src/index.ts',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format}.js`
    },
    rollupOptions: {
      external: externals
    }
  },
  optimizeDeps: {
    exclude: externals
  }
});
