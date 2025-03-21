import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [react(), dts()],
  build: {
    lib: {
      entry: './src/index.ts',
      name: 'ManagedGLB',
      fileName: (format) => `index.${format}.js`
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'three', '@react-three/fiber', '@react-three/drei'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@react-three/fiber': 'ReactThreeFiber',
          '@react-three/drei': 'ReactThreeDrei',
          three: 'THREE'
        }
      }
    }
  },
  optimizeDeps: {
    exclude: ['react', 'react-dom', '@react-three/fiber', '@react-three/drei', 'three']
  }
});
